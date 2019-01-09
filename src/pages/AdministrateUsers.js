
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

import Global, {
    CoreSnasCRLight,
    CoreSnasCRRegular,
    CoreSnasCRBold,
} from '../Global/Global'

// import Global from '../Global';
import { BallIndicator } from 'react-native-indicators';
import OneSignal from 'react-native-onesignal'; // Import package from node modules

var deviceWidth = Dimensions.get('window').width;
var deviceHight = Dimensions.get('window').height;
var bannerHeight = deviceHight * 0.1;
var topSectionHeight = 120;
var mainSectionHeight = deviceHight - (topSectionHeight + bannerHeight + 40);
var componentHeight = (deviceWidth - 30) / 2;

var first_time = true;

var current_fetching_data = false;
const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = 0;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
};

export default class AdministrateUsers extends Component {
	static navigationOptions = {
		header: null,
	};

	constructor(props) {
        super(props);
        
        this.state = {
            isReady: false,
            user_list: [],
            // user_list: [['Paramjit', '111@email.com', ''], ['PatrickCox', '2222@email.com', ''], ['Henry Bryant', '333@email.com', ''],
            // ['Joe Lewis', '5555@email.com', ''], ['Jimmy Green', '7777@email.com', ''], ['User11', '111@email.com', ''],
            // ['User22', '111@email.com', ''], ['User33', '111@email.com', '']],
            password: '',///item[0]: index of type; (0: burglary, 1: fire and smoke, 2: suspicious, 3: help 112), item[1]: proposal username,  item[2]: contents,  item[3]: time,  item[4]: DB index
        
            selected_user_id: '',

            selected_language: 1,////if 0 then Sweden, if 1 then English

            showIndicator: false,

            ads_image: '',
            ads_link: '',
            ads_id: -1,


            groupusers_fetch_index: 0,
            groupusers_last: false,
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
                }                
            })
            .catch(function(error) {
            })
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

		// BackHandler.addEventListener('hardwareBackPress', () => {return true});
		// Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT);
        // StatusBar.setHidden(true);

        // alert(deviceHight + " " + mainSectionHeight + " " + topSectionHeight + " " + bannerHeight);

        this.getGroupUsers();

        
    };

    getGroupUsers = async() => {
        this.setState({showIndicator: true});
        self = this;
        await fetch('https://safetyzonemessage.com/api/get-group-users', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + Global.token,
                },
                body: JSON.stringify({
                    'page': this.state.groupusers_fetch_index
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
                } else if(data.status === 'success') {
                    self.setState({groupusers_last: data.end});
                    var user_item = [];
                    var users = data.users;
                    if(users.length > 0) {
                        for(i = 0; i < users.length; i ++) {
                            if(users[i].profile.avatar === '') {
                                user_item = [users[i].profile.first_name + ' ' + users[i].profile.family_name, users[i].profile.street_address, '', users[i].id, users[i].profile.is_admin];
                            } else {
                                user_item = [users[i].profile.first_name + ' ' + users[i].profile.family_name, users[i].profile.street_address, 'https://safetyzonemessage.com/images/users/' + users[i].profile.avatar, users[i].id, users[i].profile.is_admin];
                            }
                            self.setState({
                                user_list: [...self.state.user_list, user_item],
                            });
                        }
                    } else {
                        self.setState({
                            user_list: [],
                        });
                    }
                } else if(data.message === 'token_expired') {
                    Alert.alert('Please notice!', 'Please sign in again');
                }
            })
            .catch(function(error) {
                console.log(error);
                if(self.state.selected_language === 1) {
                    Alert.alert('Please notice!', 'Network error.');
                } else if(self.state.selected_language === 0) {
                    Alert.alert('Observera!', 'Nätverksproblem.');
                }
            })
        current_fetching_data = false;
        this.setState({showIndicator: false});
    };

    onScrollEndEvent = () => {
        if(!current_fetching_data) {
            if(!this.state.groupusers_last) {
                current_fetching_data = true;
                this.setState({ 
                    groupusers_fetch_index: this.state.groupusers_fetch_index + 1,
                }, () => {
                    this.getGroupUsers();
                });
            }
        }
    }

    goHome = () => {
        this.setState({ads_image: ''});
        this.props.navigation.navigate('Home');
        // alert("5555555");
    };

    showUserStatus = (user_id, index) => {
        if(this.state.selected_user_id === user_id) {
            this.setState({
                selected_user_id: ''
            });
        } else {
            this.setState({
                selected_user_id: user_id
            });
        }
    };

    adminProcessing = async(user_id, user_status, index) => {
        var user_list = this.state.user_list;
        var fetch_method = '';
        
        if(user_status === '0') {
            fetch_method = 'POST';
        } else if(user_status === '1') {
            fetch_method = 'DELETE';
        }

        this.setState({showIndicator: true});

        self = this;
        await fetch('https://safetyzonemessage.com/api/user/group/' + user_id, {
                method: fetch_method,
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
                    if(user_status === '0') {
                        user_list[index][4] = '1';
                    } else if(user_status === '1') {
                        user_list[index][4] = '0';
                    }
                    self.setState({user_list: user_list});
                } else if(data.message === 'token_expired') {
                    Alert.alert('Please notice!', 'Please sign in again');
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

    deleteUser = async(user_id, index) => {
        this.setState({showIndicator: true});
        self = this;
        await fetch('https://safetyzonemessage.com/api/user', {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + Global.token,
                },
                body: JSON.stringify({
                    'id': user_id
                })
            })
            .then(response => response.json())
            .then(data => {
                if(data.status === 'fail') {
                    if(self.state.selected_language === 1) {
                        Alert.alert("Please notice!", 'There is something wrong in server.');
                    } else if(self.state.selected_language === 0) {
                        Alert.alert("Observera!", 'Något är fel med servern.');
                    }
                } else if(data.status === 'success'){
                    var user_list = [...this.state.user_list];
                    user_list.splice(index, 1);
                    this.setState({user_list: user_list});
                    if(self.state.selected_language === 1) {
                        Alert.alert('Notice', 'Selected user has now been deleted from your group');
                    } else if(self.state.selected_language === 0) {
                        Alert.alert('Observera', 'Användaren har raderats.');
                    }
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

    deleteUserAlert = (user_id, index) => {
        // alert('ppp' + user_id + 'ooooo' + index + 'uuuuu');
        const self = this;
        if(self.state.selected_language === 1) {
            Alert.alert('Notice', 'Do you really want to delete this user?',
                [
                    {text: 'Cancel', onPress: null},
                    {text: 'OK', onPress: () => self.deleteUser(user_id, index)}
                ],
                { cancelable: false }
            );
        } else if(self.state.selected_language === 0) {
            Alert.alert('Observera', 'Vill du verkligen ta bort användaren?',
                [
                    {text: 'Avbryt', onPress: null},
                    {text: 'OK', onPress: () => self.deleteUser(user_id, index)}
                ],
                { cancelable: false }
            );
        }
        return false;
        
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
                        <Text style = {styles.title_text}> {this.state.selected_language === 0 ? 'Hantera användare' : 'Administrate Users'} </Text>
                    {/* </ImageBackground> */}
                </View>
                <View style = {styles.marker_view}>
                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {require('../assets/images/activity_mark.png')}/>
                </View>
                <View style = {styles.main_section}>
                    <ScrollView showsVerticalScrollIndicator = {false} style = {{width: '95%'}}
                        onScroll={({nativeEvent}) => {
                            if(isCloseToBottom(nativeEvent)) {this.onScrollEndEvent()}
                        }} 
                        scrollEventThrottle={0}
                    >
                    {
                        this.state.user_list.map((item, index) => 
                            <View style = {{width: '100%'}}>
                                <TouchableOpacity key = {index} style = {styles.component_view} onPress = {() => this.showUserStatus(item[3], index)}>
                                    <View style = {styles.icon_view}>
                                    {
                                        (item[2] === '') &&
                                        <Image style = {{height: 50, aspectRatio: 1, borderRadius: 25, overflow: 'hidden'}} resizeMode = {'contain'} source = {require('../assets/images/empty_picture.png')}/>
                                    }
                                    {
                                        (item[2] !== '') &&
                                        <Image style = {{height: 50, aspectRatio: 1, borderRadius: 25, overflow: 'hidden'}} resizeMode = {'contain'} source = {{uri: item[2]}}/>
                                    }
                                    </View>
                                    <View style = {styles.userinfo_view}>
                                        <View style = {styles.name_view}>
                                            <Text style = {styles.name_text}>{item[0]}</Text>
                                        </View>
                                        <View style = {styles.email_view}>
                                            <Text style = {styles.email_text}>{item[1]}</Text>
                                        </View>
                                    </View>
                                    {/* <View style = {styles.deleteicon_view}>
                                        <TouchableOpacity style = {{width: '60%', height: '60%', alignItems: 'center', justifyContent: 'center'}} onPress = {() => this.deleteUserAlert(item[3], index)}>
                                            <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/delete_account.png')}/>
                                        </TouchableOpacity>
                                    </View> */}
                                </TouchableOpacity>
                                {
                                    (this.state.selected_user_id === item[3]) &&
                                    <View style = {{backgroundColor: '#0a0f2c', width: '95%', height: 50, marginLeft: '5%', marginBottom: 5, borderRadius: 10, flexDirection: 'row'}}>
                                        <View style = {{width: '50%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                                            <TouchableOpacity style = {{width: '80%', height: '60%', borderRadius: 5, backgroundColor: '#ff4858', justifyContent: 'center', alignItems: 'center'}} onPress = {() => this.adminProcessing(item[3], item[4], index)}>
                                            {
                                                (item[4] === '0') &&
                                                <Text style = {{fontSize: 10, color: '#ffffff', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}> {this.state.selected_language === 0 ? 'Gör till Admin' : 'Make Admin'} </Text>
                                            }
                                            {
                                                (item[4] === '1') &&
                                                <Text style = {{fontSize: 10, color: '#ffffff', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}> {this.state.selected_language === 0 ? 'Ta bort admin' : 'Cancel Admin'} </Text>
                                            }
                                            </TouchableOpacity>
                                        </View>
                                        <View style = {{width: '50%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                                            <TouchableOpacity style = {{width: '80%', height: '60%', borderRadius: 5, backgroundColor: '#ff4858', justifyContent: 'center', alignItems: 'center'}} onPress = {() => this.deleteUserAlert(item[3], index)}>
                                                <Text style = {{fontSize: 10, color: '#ffffff', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}> {this.state.selected_language === 0 ? 'Radera användare' : 'Delete User'} </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                }
                            </View>
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
        height: 60,
        backgroundColor: '#0a0f2c',
        borderRadius: 10,
        marginBottom: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon_view: {
        width: '20%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userinfo_view: {
        // width: '60%',
        width: '80%',
        height: '80%'
    },
    name_view: {
        width: '100%',
        height: '60%',
        // marginTop: 10,
    },
    logcontents_view: {
        width: '100%',
        height: '30%',
        marginTop: 5,
    },
    name_text: {
        fontSize: 15,
        color: '#bfc1d1',
        fontFamily: 'coreSansBold',
        paddingTop: Platform.OS === 'android' ? 0 : 7
    },
    logcontents_text: {
        fontSize: 12,
        color: '#7c8193',
        fontFamily: 'coreSansBold',
        paddingTop: Platform.OS === 'android' ? 0 : 6
    },
    email_view: {
        width: '100%',
        height: '40%',
        // marginTop: 5,
    },
    email_text: {
        fontSize: 12,
        color: '#bfc1d1',
        fontFamily: 'coreSansBold',
        paddingTop: Platform.OS === 'android' ? 0 : 6
    },
    deleteicon_view: {
        width: '20%',
        height: '70%',
        // borderRadius: 5,
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