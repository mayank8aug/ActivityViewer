class ActivityComponent extends React.Component {

    constructor(props) {
        super(props);
        this.loadingInidicatorEl = document.getElementById('loader');
        this.bodyEl = document.getElementsByTagName('body')[0];
        this.state = {
            tabName: 'give',
            isTabDataLoaded: false,
            isError: false,
            tabData: [],
            errorMsg: '',
            searchKey: '',
            filteredData: []
        };
        this.initListenersBinding();
    }

    showLoadingIndicator() {
        this.loadingInidicatorEl.style.display = 'block';
        this.bodyEl.classList.add('bodyOverlay');
    }

    hideLoadingIndicator() {
        this.loadingInidicatorEl.style.display = 'none';
        this.bodyEl.classList.remove('bodyOverlay');
    }

    initListenersBinding() {
        const tabEls = document.getElementsByClassName('tab');
        this.attachListeners(tabEls);
    }

    changeTab(e) {
        const clickedTabId = e.target.closest('li').getAttribute('id');
        this.setState({tabName: clickedTabId});
        this.fetchTabData(clickedTabId);
    }

    attachListeners(tabEls) {
        if(!tabEls || tabEls.length < 1)
            return;
        for(let i = 0; i < tabEls.length; i++) {
            tabEls[i].addEventListener('click', this.changeTab.bind(this));
        }
    }

    componentWillMount() {
        this.fetchTabData(this.state.tabName);
    }

    fetchTabData(tab) {
        this.setState({tabData: [], filteredData: [], isTabDataLoaded: false, isError: false, errorMsg: ''});
        this.showLoadingIndicator();
        let url;
        if(systemProperties && systemProperties.loadDataFromLocal) {
            url = tab === 'give' ? systemProperties.filePathGive : systemProperties.filePathGet;
        } else {
            url = "http://staging.hourvillage.com/api/activity/list/?u=d87eebc0ac661da3c7b20b76ffc238e5&role="+tab.trim();
        }
        fetch(url)
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        searchKey: '',
                        isTabDataLoaded: true,
                        tabData: result['activities'],
                        filteredData: result['activities'],
                        isError: false,
                        errorMsg: ''
                    });
                    this.hideLoadingIndicator();
                },
                (error) => {
                    this.setState({
                        searchKey: '',
                        isTabDataLoaded: true,
                        isError: true,
                        errorMsg: 'Error occurred while fetching data.'
                    });
                    this.hideLoadingIndicator();
                }
            )
    }

    filterDataSet(e) {
        const searchQuery = e.target.value.toLowerCase();
        this.setState({ searchKey: searchQuery });
        let dataToBeRendered = [];
        const data = this.state.tabData;
        let dataItem;
        for(let i = 0; i < data.length; i++) {
            dataItem = data[i];
            if((dataItem['title'].toLowerCase()).indexOf(searchQuery) > -1) {
                dataToBeRendered.push(dataItem);
            }
        }
        this.setState({filteredData: dataToBeRendered});
    }

    render() {
        const { isTabDataLoaded, isError, errorMsg, searchKey, filteredData } = this.state;
        return (
            <div>
                <div id="searchId">
                    <input type="text" id="searchInput" name="searchQuery" value={searchKey} placeholder="Search" onChange={ this.filterDataSet.bind(this) } />
                    <span className={"searchIcon"}></span>
                </div>
                <div id={'cardsGroup'}>
                {isTabDataLoaded && filteredData.length > 0 ?
                    filteredData.map(activity => (
                        <div key={activity['id']} className={'cardContainer'}>
                            <div className={'bannerImg'}>
                                <div className={'sessionAndAuthor'}>
                                    <div className={'sessionDetails'}>
                                        <span className={'sessionCount'}>{activity['session_details']['session_series_count']} Session</span>
                                        &nbsp;|&nbsp;
                                        <span className={'groupDetails'}>{activity['group_details']['num_participants'] > 1 ? 'Group Event' : 'One On One'}</span>
                                    </div>
                                    <div className={'author'}>
                                        <span className={'authorName'}>{activity['creator']['name']}</span>
                                    </div>
                                </div>
                            </div>
                            <div className={'activityOverview'}>
                                <div title={activity['title']} className={'activityTitle'}>
                                    {activity['is_online'] ? <span title={'This activity is online now.'} className="onlineIndicator"></span> : ''}
                                    <span>{activity['title']}</span>
                                </div>
                                <div className={'eventDetails'}>
                                    <div className={'eventDate'}><span className={"glyphicon glyphicon-calendar"}></span>{(new Date(activity['session_details']['session']['date'])).toDateString()}</div>
                                    <div title={activity['session_details']['session']['location_details']['location_name']} className={'eventLocation'}><div className={"glyphicon glyphicon-map-marker"}></div><div className={'location'}> {activity['session_details']['session']['location_details']['location_name']}</div></div>
                                </div>
                            </div>
                            <div className={'authorImg'}><img src={'./userpic.png'} width={'50px'} height={'50px'}/></div>
                            <div className={'activityDuration'}>{activity['time_details']['label']}</div>
                        </div>
                    )) : isTabDataLoaded && filteredData.length === 0 && !isError ? <span className={"errorContainer"}>No data found..</span> : <span className={'errorContainer'}>{errorMsg}</span>}
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <ActivityComponent/>, document.getElementById('tab-content')
);