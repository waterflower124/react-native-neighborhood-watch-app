
import React, {Component} from 'react';
import { StyleSheet, Text, View, Navigator,
	ImageBackground,
	Image,
	TouchableOpacity,
	StatusBar,
	BackHandler,
	TouchableHighlight,
	Platform,
	Vibration,
    Alert,
    Dimensions,
    TextInput,
    ScrollView,
    Linking,
 } from 'react-native';

import {Font, Constants} from 'expo';

import { BallIndicator } from 'react-native-indicators';

import Global, {
    CoreSnasCRLight,
    CoreSnasCRRegular,
    CoreSnasCRBold,
} from '../Global/Global'

import OneSignal from 'react-native-onesignal'; // Import package from node modules

var deviceWidth = Dimensions.get('window').width;
var deviceHight = Dimensions.get('window').height;
var bannerHeight = deviceHight * 0.1;
var topSectionHeight = 120;
var mainSectionHeight = deviceHight - (topSectionHeight + bannerHeight + 40);
var componentHeight = (deviceWidth - 30) / 2;

var current_fetching_data = false;


const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = 0;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
};



export default class ActivityLog extends Component {
	static navigationOptions = {
		header: null,
	};

	constructor(props) {
        super(props);
        
        this.state = {
            isReady: false,
            // activitylog_list: [['Burglary', 'Paramjit', 'Lorem ipsumLorem ipsumLorem ipsumLorem ipsumipsumLorem', '4:02 pm Sep 02 2018', '12'], ['Suspicious Activity', 'PatrickCox', 'Lorem ipsum ...', '4:02 pm Sep 02 2018', '9'], ['Fire and Smoke', 'Henry Bryant', 'Lorem ipsum ...', '4:02 pm Sep 02 2018', '18'],
            // ['Suspicious Activity', 'Joe Lewis', 'Lorem ipsum ...', '4:02 pm Sep 02 2018', '4'], ['Need Immediate Help', 'Jimmy Green', 'Lorem ipsum ...', '4:02 pm Sep 02 2018', '67'], ['Burglary', 'User11', 'Lorem ipsum ...', '4:02 pm Sep 02 2018', '2'],
            // ['Need Immediate Help', 'User22', 'Lorem ipsum ...', '4:02 pm Sep 02 2018', '14'], ['Fire and Smoke', 'User33', 'Lorem ipsum ...', '4:02 pm Sep 02 2018', '7']],
            activitylog_list: [],
            password: '',///item[0]: index of type; (0: burglary, 1: fire and smoke, 2: suspicious, 3: help 112), item[1]: proposal username,  item[2]: contents,  item[3]: time,  item[4]: DB index
            
            selected_language: 1,////if 0 then Sweden, if 1 then English

            showIndicator: false,

            month_array_english: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            month_array_sweden: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],

            ads_image: '',
            ads_link: '',
            ads_id: -1,

            notification_fetch_index: 0,
            notification_last: false,

        };

    };

    initLanguage() {
        Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT);
        this.setState({selected_language: Global.language});

        this.onOpened = this.onOpened.bind(this);

        this.oneSignalEventListener = OneSignal.addEventListener('opened', this.onOpened);

        self = this;
        fetch('https://safetyzonemessage.com/api/advertisement/get', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + Global.token,
                },
                body: JSON.stringify({
                })
            })
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                if(data.status === 'fail') {
                } else if(data.status === 'success') {

                    self.setState({
                        ads_image: 'https://safetyzonemessage.com/images/advertisements/' + data.image,
                        ads_link: data.link,
                        ads_id: data.id,
                    });
                } else if(data.message === 'token_expired') {
                    // Alert.alert('Please notice!', 'Please signin again.');
                }               
            })
            .catch(function(error) {
            });
        
        if(this.props.navigation.state.params) {
            if(this.props.navigation.state.params.passingScreen) {
                var passingScreen = this.props.navigation.state.params.passingScreen;
                var notification_id = -1;
                if(passingScreen === 'ShowNotification') {
                    notification_id = this.props.navigation.state.params.notification_id;
                    var activitylog_list = this.state.activitylog_list;
                    for(i = 0; i < activitylog_list.length; i ++) {
                        if(activitylog_list[i][5] === notification_id) {
                            var array = [...this.state.activitylog_list];
                            array.splice(i, 1);
                            this.setState({activitylog_list: array});
                            break;
                        }
                    }
                }
            }
        }
    };

    onOpened(openResult) {
        var notification_id = openResult.notification.payload.additionalData.notification_id;
        this.props.navigation.navigate('ShowNotification', {notification_id: notification_id, backButtonAction: false});
            
    }

    componentDidMount() {
        this.props.navigation.addListener('willFocus', this.initLanguage.bind(this));
    }

    async componentWillMount() {

        await Expo.Font.loadAsync({
            coreSansLight: CoreSnasCRLight,
            coreSansRegular: CoreSnasCRRegular,
            coreSansBold: CoreSnasCRBold,
        });
        this.setState({isReady: true});

        this.getNotifications();

		// BackHandler.addEventListener('hardwareBackPress', () => {return true});
		// Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT);
        // StatusBar.setHidden(true);

        // alert(deviceHight + " " + mainSectionHeight + " " + topSectionHeight + " " + bannerHeight);

        
    };

    onScrollEndEvent = () => {
        if(!current_fetching_data) {
            if(!this.state.notification_last) {
                current_fetching_data = true;
                this.setState({ 
                    notification_fetch_index: this.state.notification_fetch_index + 1,
                }, () => {
                    this.getNotifications();
                });
            }
        }
    }

    getNotifications = async() => {
        this.setState({showIndicator: true});
        self = this;
        await fetch('https://safetyzonemessage.com/api/get-notification', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + Global.token,
                },
                body: JSON.stringify({
                    'page': this.state.notification_fetch_index
                })
            })
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                if(data.status === 'fail') {
                    if(self.state.selected_language === 1) {
                        Alert.alert("Please notice!", 'There is something wrong in server.');
                    } else if(self.state.selected_language === 0) {
                        Alert.alert("Observera!", 'Något är fel med servern.');
                    }
                } else if(data.status === 'success'){
                    
                    this.setState({notification_last: data.end});
                    var notification_array = data.notifications;

                    var notification_type = '';
                    var post_user_email = '';
                    var notification_contents = '';
                    var create_date = '';
                    var create_date_formatted = '';
                    var notification_id = 0;
                    var avatar_uri = '';
                    var post_name = '';
                    var notification_user_address = '';
                    var group_id = '';

                    var notification_info = [];

                    var token = [];
                    var subtoken1 = [];
                    var subtoken2 = [];

                    for(i = 0; i < notification_array.length; i ++) {
                        notification_type = notification_array[i].type;
                        notification_contents = notification_array[i].contents;
                        create_date = notification_array[i].created_at;
                        notification_id = notification_array[i].id;
                        group_id = notification_array[i].group_id;
                        if(notification_type === '5') {
                            notification_user_address = '';
                        } else {
                            notification_user_address = notification_array[i].user.simple_profile.street_address;
                        }
                        if(notification_array[i].user.simple_profile.avatar === '') {
                            avatar_uri = ''
                        } else {
                            avatar_uri = 'https://safetyzonemessage.com/images/users/' + notification_array[i].user.simple_profile.avatar;
                        };
                        if(notification_type === '5') {
                            post_name = 'Safety Zone';
                        } else {
                            post_name = notification_array[i].user.simple_profile.first_name + ' ' + notification_array[i].user.simple_profile.family_name;
                        }

                        // console.log(create_date)
                        token = create_date.split(' ');
                        subtoken1 = token[0].split('-');
                        subtoken2 = token[1].split(':');

                        // create_date_formatted = subtoken2[0] + ':' + subtoken2[1] + ' ' + self.state.month_array_english[parseInt(subtoken1[1], 10) - 1] + ' ' + subtoken1[2] + ' ' + subtoken1[0];
                        if(Global.language === 0) {
                            create_date_formatted = subtoken1[0] + ' ' + self.state.month_array_sweden[parseInt(subtoken1[1], 10) - 1] + ' ' + subtoken1[2] + ' ' + subtoken2[0] + ':' + subtoken2[1];
                        } else {
                            create_date_formatted = subtoken1[0] + ' ' + self.state.month_array_english[parseInt(subtoken1[1], 10) - 1] + ' ' + subtoken1[2] + ' ' + subtoken2[0] + ':' + subtoken2[1];
                        }
                        notification_info = [notification_type, post_name, notification_contents, create_date_formatted, avatar_uri, notification_id, notification_user_address, group_id];
                        self.setState({ activitylog_list: [...self.state.activitylog_list, notification_info]});
                        
                    }
                } else if(data.message === 'token_expired') {
                    Alert.alert('Please notice!', 'Please sign in again.')
                }
                
            })
            .catch(function(error) {
                // console.log('Network error countryyyyyy');
                if(self.state.selected_language === 1) {
                    Alert.alert('Please notice!', 'Network error.');
                } else if(self.state.selected_language === 0) {
                    Alert.alert('Observera!', 'Nätverksproblem.');
                }
            })
        
        current_fetching_data = false;
        this.setState({showIndicator: false});
    }

    goHome = () => {
        // console.log('kkk:' + this.state.activitylog_list.length);
        this.props.navigation.navigate('Home');
        // alert("5555555");
    };

    showNotification = (index) => {
        this.setState({ads_image: ''});
        // this.setState({activitylog_list: []});
        this.props.navigation.navigate('ShowNotification', {notification_id: index, backButtonAction: false});
    };

    onClickAds = () => {
        self = this;
        fetch('https://safetyzonemessage.com/api/advertisement/click', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + Global.token,
                },
                body: JSON.stringify({
                    'advertisement_id': self.state.ads_id
                })
            })
            .then(response => response.json())
            .then(data => {
                // console.log(self.state.ads_link);
                Linking.canOpenURL(self.state.ads_link).then(supported => {
                    if(supported) {
                        Linking.openURL(self.state.ads_link); 
                    } else {
                        if(self.state.selected_language === 1) {
                            Alert.alert('Please notice!', 'Can not open this Ads.');
                        } else if(self.state.selected_language === 0) {
                            Alert.alert('Observera!', 'Annonsen kan inte öppnas.');
                        }
                    }
                });
            })
            .catch(function(error) {
                if(self.state.selected_language === 1) {
                    Alert.alert('Please notice!', 'Network error.');
                } else if(self.state.selected_language === 0) {
                    Alert.alert('Observera!', 'Nätverksproblem.');
                }
            })
    };

    componetViewStyle(activityType, notification_groupID) {
        if(activityType === '5') {
            return {
                width: '100%',
                height: 80,
                backgroundColor: '#0e1437',
                borderRadius: 10,
                marginBottom: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
            };
        } else {
            if(notification_groupID === Global.group_id) {
                return {
                    width: '100%',
                    height: 80,
                    backgroundColor: '#0a0f2c',
                    borderRadius: 10,
                    marginBottom: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                };
            } else {
                return {
                    width: '100%',
                    height: 80,
                    backgroundColor: '#121943',
                    borderRadius: 10,
                    marginBottom: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                };
            }
        }
    }

    
    render() {
        if (!this.state.isReady) {
            return <Expo.AppLoading/>;
        }
        return (
            <View style={styles.container}>
                {
                    this.state.showIndicator &&
                    <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', opacity: 0.5, zIndex: 100}}>
                        <View style = {{flex: 1}}>
                            <BallIndicator color = '#ffffff' size = {50} count = {8}/>
                        </View>
                    </View>
                }
                <TouchableOpacity style = {styles.back_button_view} onPress = {() => this.goHome()}>
                    <View style = {{width: 12, height: '100%'}}>
                        <Image style = {{width: '100%', height: '100%'}} resizeMode = 'contain' source = {require('../assets/images/left_arrow.png')}/>
                    </View>
                    {/* <View style = {{width: '70%', height: '100%', justifyContent: 'center', marginLeft: 5}}>
                        <Text style = {{fontSize: 12, color: '#ffffff', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}> {this.state.selected_language === 0 ? 'Hem' : 'Home'} </Text>
                    </View> */}
                </TouchableOpacity>
                <View style = {styles.top_section}>
                    {/* <ImageBackground style = {{width: '100%', height: '100%', alignItems: 'center'}} resizeMode = {'stretch'} source = {require('../assets/images/top_head.png')}> */}
                        <Text style = {styles.title_text}> {this.state.selected_language === 0 ? 'Aktivitetslogg' : 'Activity Log'} </Text>
                    {/* </ImageBackground> */}
                </View>
                <View style = {styles.marker_view}>
                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {require('../assets/images/activity_mark.png')}/>
                </View>
                <View style = {styles.main_section}>
                    <ScrollView showsVerticalScrollIndicator = {false} style = {{width: '95%'}} onScroll={({nativeEvent}) => {
                        if(isCloseToBottom(nativeEvent)) {this.onScrollEndEvent()}
                    }} scrollEventThrottle={0}>
                    {
                        this.state.activitylog_list.map((item, index) => 
                            <TouchableOpacity key = {index} style = {this.componetViewStyle(item[0], item[7])} onPress = {() => this.showNotification(item[5])}>
                                <View style = {styles.icon_view}>
                                {
                                    (item[0] === '1') && 
                                    <Image style = {{width: '80%', height: '80%'}} resizeMode = {'contain'} source = {require('../assets/images/activitylog_burglary.png')}/>
                                }
                                {
                                    (item[0] === '2') && 
                                    <Image style = {{width: '80%', height: '80%'}} resizeMode = {'contain'} source = {require('../assets/images/activitylog_fire.png')}/>
                                }
                                {
                                    (item[0] === '3') && 
                                    <Image style = {{width: '80%', height: '80%'}} resizeMode = {'contain'} source = {require('../assets/images/activitylog_suspicious.png')}/>
                                }
                                {
                                    (item[0] === '4') && 
                                    <Image style = {{width: '80%', height: '80%'}} resizeMode = {'contain'} source = {require('../assets/images/activitylog_help112.png')}/>
                                }
                                {
                                    (item[0] === '5') && 
                                    <Image style = {{width: '80%', height: '80%'}} resizeMode = {'contain'} source = {require('../assets/images/activitylog_system.png')}/>
                                }
                                </View>
                                <View style = {styles.loginfo_view}>
                                    <View style = {styles.name_view}>
                                        <Text style = {styles.name_text}>{item[3]}</Text>
                                    </View>
                                    <View style = {styles.logcontents_view}>
                                        <Text style = {styles.logcontents_text} numberOfLines = {1} renderTruncatedFooter = {() => null}>{item[1]}</Text>
                                    </View>
                                    <View style = {styles.datetime_view}>
                                        <Text style = {styles.datetime_text}>{item[6]}</Text>
                                    </View>
                                </View>
                                <View style = {styles.photo_view}>
                                {
                                    (item[4] === '') && (item[0] !== '5') &&
                                        <Image style = {{width: '80%', height: '100%', borderRadius: 5, overflow: 'hidden'}} resizeMode = {'contain'} source = {require('../assets/images/empty_avatar.png')}/>
                                }
                                {
                                    (item[4] !== '') && (item[0] !== '5') &&
                                        <Image style = {{width: '80%', aspectRatio: 1, borderRadius: 5, overflow: 'hidden'}} resizeMode = {'contain'} source = {{uri: item[4]}}/>
                                }
                                </View>
                            </TouchableOpacity>
                        )
                    }
                    </ScrollView>
                </View>
                <TouchableOpacity style = {styles.banner_section} onPress = {() => this.onClickAds()}>
                {
                    (this.state.ads_image !== '')&&
                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {{uri: this.state.ads_image}}/>
                }
                </TouchableOpacity>
                
            </View>
        );
    }

}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#392b59',
		alignItems: 'flex-start',
        // justifyContent: 'center',
    },
    back_button_view: {
        position: 'absolute',
        zIndex: 10,
        left: 10,
        top: 30,
        width: 100,
        height: 30,
        flexDirection: 'row',
    },
    top_section: {
        width: '100%',
        height: topSectionHeight,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        overflow: 'hidden',
        backgroundColor: '#4567f2',
        alignItems: 'center'
    },
    marker_view: {
        position: 'absolute',
        width: 80,
        height: 80,
        left: deviceWidth / 2 - 40,
        top: 80,
        // backgroundColor: '#444444'
    },
    title_text: {
        color: '#ffffff',
        fontSize: 20,
        marginTop: 40,
        fontFamily: 'coreSansBold',
        paddingTop: Platform.OS === 'android' ? 0 : 10
    },
    main_section: {
        width: '100%',
        height: mainSectionHeight - 20,
        // backgroundColor: '#555555',
        marginTop: 50,
        // marginLeft: 10,
        // marginRight: 10,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    component_view: {
        width: '100%',
        height: 80,
        // backgroundColor: '#0a0f2c',
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon_view: {
        width: '20%',
        height: '70%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginfo_view: {
        width: '60%',
        height: '80%'
    },
    name_view: {
        width: '100%',
        height: '33%',
        // marginTop: 10,
    },
    logcontents_view: {
        width: '100%',
        height: '33%',
        marginTop: 5,
    },
    name_text: {
        fontSize: 15,
        color: '#bfc1d1',
        fontFamily: 'coreSansBold',
        paddingTop: Platform.OS === 'android' ? 0 : 7
    },
    logcontents_text: {
        fontSize: 15,
        // color: '#7c8193',
        color: '#bfc1d1',
        fontFamily: 'coreSansBold',
        paddingTop: Platform.OS === 'android' ? 0 : 7
    },
    datetime_text: {
        fontSize: 15,
        color: '#bfc1d1',
        fontFamily: 'coreSansBold',
        paddingTop: Platform.OS === 'android' ? 0 : 7
    },
    datetime_view: {
        width: '100%',
        height: '33%',
        // marginTop: 5,
    },
    photo_view: {
        width: '20%',
        height: '100%',
        borderRadius: 5,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    banner_section: {
        position: 'absolute',
        width: '100%',
        height: bannerHeight,
        bottom: 0,
        backgroundColor: '#392b59',
    },

    
});