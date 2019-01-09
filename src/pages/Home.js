
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

import {Font, Constants, SQLite} from 'expo';
import { BallIndicator } from 'react-native-indicators';
import Communications from '../components/communication/AKCommunications';
import Orientation from 'react-native-orientation'
import call from 'react-native-phone-call'
import OneSignal from 'react-native-onesignal'; // Import package from node modules

import Global, {
    CoreSnasCRLight,
    CoreSnasCRRegular,
    CoreSnasCRBold,
} from '../Global/Global'

const dBase = SQLite.openDatabase('dBase.db');
const dBaseLanguage = SQLite.openDatabase('dBaselanguage.db');
const dBaseAlarm = SQLite.openDatabase('dBasealarm2.db');

const call_args = {
    number: '112333', // Use commas to add time between digits.
    prompt: false
  }


var deviceWidth = Dimensions.get('window').width;
var deviceHight = Dimensions.get('window').height;
var bannerHeight = deviceHight * 0.1;
var topSectionHeight = 120;
var mainSectionHeight = deviceHight - (topSectionHeight + bannerHeight + 40);

export default class Home extends Component {
	static navigationOptions = {
		header: null,
	};

	constructor(props) {
        super(props);
        
        this.state = {
            isReady: false,

            group_manager: Global.group_manager,

            selected_language: 1,////if 0 then Sweden, if 1 then English
            
            ads_image: '',
            ads_link: '',
            ads_id: -1,

            // currentRouteName: 'Home',

        };
    };

    initLanguage() {
        // this.backButtonListener = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton.bind(this));
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
                console.log(data);
                if(data.status === 'fail') {
                    // Alert.alert('Warnning!', 'There is something wrong')
                } else if(data.status === 'success') {

                    self.setState({
                        ads_image: 'https://safetyzonemessage.com/images/advertisements/' + data.image,
                        ads_link: data.link,
                        ads_id: data.id,
                    });
                }                
            })
            .catch(function(error) {
                // Alert.alert('Warnning!', 'Network error.');
            })

    };

    onOpened(openResult) {
        var notification_id = openResult.notification.payload.additionalData.notification_id;
        this.props.navigation.navigate('ShowNotification', {notification_id: notification_id, backButtonAction: false});
    }

   
    componentDidMount() {
        this.props.navigation.addListener('willFocus', this.initLanguage.bind(this));

        // BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

        
    }

    async componentWillMount() {

        // console.log(deviceWidth + '++ ' + bannerHeight);
        // console.log(this.props.navigation.state.routeName);

        await Expo.Font.loadAsync({
            coreSansLight: CoreSnasCRLight,
            coreSansRegular: CoreSnasCRRegular,
            coreSansBold: CoreSnasCRBold,
        });
        this.setState({isReady: true});
        // Orientation.lockToLandscape();

		// BackHandler.addEventListener('hardwareBackPress', () => {return true});
		// Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT);
        // StatusBar.setHidden(true);


    };

 
    initGlobal = () => {
        Global.token = '';
        // Global.countries = [];
        Global.group_manager = false;
        Global.current_email = '';
        Global.current_password = '';
    }

    signoutAccount = async() => {

        this.setState({showIndicator: true});
        self = this;
        await fetch('https://safetyzonemessage.com/api/logout', {
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
                console.log(data);
                if(data.status === 'fail') {
                    if(self.state.selected_language === 1) {
                        Alert.alert("Please notice!", 'There is something wrong in server.');
                    } else if(self.state.selected_language === 0) {
                        Alert.alert("Observera!", 'Något är fel med servern.');
                    }
                } else if(data.status === 'success'){
                    dBase.transaction(
                        tx => {
                        //   tx.executeSql('delete from items where 1');
                            tx.executeSql('update items set login = 0 where 1');
                          
                        },
                        null,
                    );
                    dBaseLanguage.transaction(
                        tx => {
                          tx.executeSql('delete from items where 1');
                          
                        },
                        null,
                    );
                    dBaseAlarm.transaction(
                        tx => {
                        tx.executeSql('delete from items where 1');
                        },
                        null,
                    );
                    self.initGlobal();
                    self.setState({ads_image: ''});
                    // self.backButtonListener.remove();
                    self.props.navigation.navigate('SignIn');
                }
            })
            .catch(function(error) {
                if(self.state.selected_language === 1) {
                    Alert.alert('Please notice!', 'Network error.');
                } else if(self.state.selected_language === 0) {
                    Alert.alert('Observera!', 'Nätverksproblem.');
                }
            })

        this.setState({showIndicator: false});
    };

    showSignoutAlert = () => {

        if(this.state.selected_language === 0) {
            const self = this;
            Alert.alert('Observera!', 'Vill du verkligen logga ut?',
                [
                    {text: 'Avbryt', onPress: null},
                    {text: 'Ok', onPress: () => self.signoutAccount()}
                ],
                { cancelable: true }
            );
        } else {
            const self = this;
            Alert.alert('Notice!', 'Do you really want to sign out?',
                [
                    {text: 'Cancel', onPress: null},
                    {text: 'Ok', onPress: () => self.signoutAccount()}
                ],
                { cancelable: true }
            );
        };
        

    };

    goMyProfilePage = () => {
        // this.backButtonListener.remove();
        this.setState({ads_image: ''});
        this.props.navigation.navigate('MyProfile');
        
    };

    goNotificationPage = () => {
        // this.backButtonListener.remove();
        this.setState({ads_image: ''});
        this.props.navigation.navigate('CreateNotification');
    };

    goActivityPage = () => {
        // this.backButtonListener.remove();
        this.setState({ads_image: ''});
        this.props.navigation.navigate('ActivityLog');
    };

    goQuickCallPage = () => {
        // this.backButtonListener.remove();
        this.setState({ads_image: ''});
        Communications.phonecall('112', true);
        // call(call_args).catch(console.error);
    };

    goMonitorPage = () => {
        alert("5555555");
    };

    administrateUsers = () => {
        // this.backButtonListener.remove();
        this.setState({ads_image: ''});
        this.props.navigation.navigate('AdministrateUsers');
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
                <TouchableOpacity style = {styles.back_button_view} onPress = {() => this.showSignoutAlert()}>
                    <View style = {{width: 12, height: '100%'}}>
                        <Image style = {{width: '100%', height: '100%'}} resizeMode = 'contain' source = {require('../assets/images/left_arrow.png')}/>
                    </View>
                    {/* <View style = {{width: '70%', height: '100%', justifyContent: 'center', marginLeft: 5}}>
                        <Text style = {{fontSize: 12, color: '#ffffff', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}> {this.state.selected_language === 0 ? 'Logga ut' : 'Sign out'} </Text>
                    </View> */}
                </TouchableOpacity>
                <View style = {styles.top_section}>
                    {/* <ImageBackground style = {{width: '100%', height: '100%', alignItems: 'center'}} resizeMode = {'stretch'} source = {require('../assets/images/top_head.png')}> */}
                        <View style = {styles.logo_view}>
                            <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/home_logo.png')}/>
                        </View>
                    {/* </ImageBackground> */}
                </View>
                <View style = {styles.marker_view}>
                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {require('../assets/images/logo_blue.png')}/>
                </View>
                <View style = {styles.main_section}>
                    <TouchableOpacity style = {[styles.component_view, this.state.group_manager ? {height: '18%'} : {height: '22.5%'}]} onPress = {() => this.goMyProfilePage()}>
                        <View style = {styles.icon_view}>
                            <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/profile.png')}/>
                        </View>
                        <View style = {styles.subtitle_view}>
                            <Text style = {styles.subtitle_head}> {this.state.selected_language === 0 ? 'Min profil' : 'My Profile'} </Text>
                        </View>
                        <View style = {styles.arrow_icon_view}>
                            <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/profile_arrow.png')}/>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style = {[styles.component_view, this.state.group_manager ? {height: '18%'} : {height: '22.5%'}]} onPress = {() => this.goNotificationPage()}>
                        <View style = {styles.icon_view}>
                            <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/notification.png')}/>
                        </View>
                        <View style = {styles.subtitle_view}>
                            <Text style = {styles.subtitle_head}> {this.state.selected_language === 0 ? 'Skapa grupplarm' : 'Send Group Alarm'} </Text>
                        </View>
                        <View style = {styles.arrow_icon_view}>
                            <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/notification_arrow.png')}/>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style = {[styles.component_view, this.state.group_manager ? {height: '18%'} : {height: '22.5%'}]} onPress = {() => this.goActivityPage()}>
                        <View style = {styles.icon_view}>
                            <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/activity.png')}/>
                        </View>
                        <View style = {styles.subtitle_view}>
                            <Text style = {styles.subtitle_head}> {this.state.selected_language === 0 ? 'Aktivitetslogg' : 'Activity Log'} </Text>
                        </View>
                        <View style = {styles.arrow_icon_view}>
                            <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/activity_arrow.png')}/>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style = {[styles.component_view, this.state.group_manager ? {height: '18%'} : {height: '22.5%'}]} onPress = {() => this.goQuickCallPage()}>
                        <View style = {styles.icon_view}>
                            <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/quick.png')}/>
                        </View>
                        <View style = {styles.subtitle_view}>
                            <Text style = {styles.subtitle_head}> {this.state.selected_language === 0 ? 'Ring 112' : 'Quick Call 112'} </Text>
                        </View>
                        <View style = {styles.arrow_icon_view}>
                            <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/quick_arrow.png')}/>
                        </View>
                    </TouchableOpacity>
                    {/* <TouchableOpacity style = {[styles.component_view, this.state.group_manager ? {height: '15%'} : {height: '18%'}]} onPress = {() => this.goMonitorPage()}>
                        <View style = {styles.icon_view}>
                            <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/monitor.png')}/>
                        </View>
                        <View style = {styles.subtitle_view}>
                            <Text style = {styles.subtitle_head}> {this.state.selected_language === 0 ? 'Övervakning' : 'Suveillence'} </Text>
                        </View>
                        <View style = {styles.arrow_icon_view}>
                            <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/monitor_arrow.png')}/>
                        </View>
                    </TouchableOpacity> */}
                    {
                        this.state.group_manager && 
                        <TouchableOpacity style = {[styles.component_view, this.state.group_manager ? {height: '18%'} : {height: '22.5%'}]} onPress = {() => this.administrateUsers()}>
                            <View style = {styles.icon_view}>
                                <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/groupadmin.png')}/>
                            </View>
                            <View style = {styles.subtitle_view}>
                                <Text style = {styles.subtitle_head}> {this.state.selected_language === 0 ? 'Hantera användare' : 'Administrate Users'} </Text>
                            </View>
                            <View style = {styles.arrow_icon_view}>
                                <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/groupadmin_arrow.png')}/>
                            </View>
                        </TouchableOpacity>
                    }
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
    logo_view: {
        width: '60%',
        height: 30,
        marginTop: 40,
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
        fontSize: 30,
        marginTop: 40,
        fontFamily: 'coreSansBold',
        paddingTop: Platform.OS === 'android' ? 0 : 15
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
        justifyContent: 'space-between',
    },
    component_view: {
        width: '95%',
        // height: this.state.group_manager ? '15%' : '18%',
        backgroundColor: '#0a0f2c',
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon_view: {
        width: '20%',
        height: '40%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    subtitle_view: {
        width: '60%',
        height: '60%',
        // alignItems: 'center',
        justifyContent: 'center',
    },
    arrow_icon_view: {
        width: '20%',
        height: '20%',
        alignItems: 'center',
    },
    subtitle_head: {
        fontSize: 15,
        color: '#bfc1d1',
        fontFamily: 'coreSansBold',
        paddingTop: Platform.OS === 'android' ? 0 : 7
    },
    subtitle_contents: {
        fontSize: 15,
        color: '#ffffff',
        fontFamily: 'coreSansBold',
        paddingTop: Platform.OS === 'android' ? 0 : 7
    },
    banner_section: {
        position: 'absolute',
        width: '100%',
        height: bannerHeight,
        bottom: 0,
        backgroundColor: '#392b59',
    },

    
});