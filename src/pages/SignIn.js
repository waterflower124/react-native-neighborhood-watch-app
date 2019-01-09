
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
    Keyboard,
    Linking,
    ScrollView,
    AppState,
 } from 'react-native';

import {Actions} from 'react-native-router-flux'

import {Font, Constants} from 'expo';
import { ImagePicker, Permissions, SQLite, Notifications } from 'expo';
import Expo from 'expo';

import Global, {
    CoreSnasCRLight,
    CoreSnasCRRegular,
    CoreSnasCRBold,
} from '../Global/Global'
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from '../components/radiobutton/RadioButton';

import Modal from 'react-native-modal';

import OneSignal from 'react-native-onesignal'; // Import package from node modules

import { BallIndicator } from 'react-native-indicators';
import Autolink from 'react-native-autolink';

import ShowNotification from './ShowNotification';

const dBase = SQLite.openDatabase('dBase.db');
const dBaseLanguage = SQLite.openDatabase('dBaselanguage.db');
const dBaseAlarm = SQLite.openDatabase('dBasealarm4.db');

var deviceWidth = Dimensions.get('window').width;
var deviceHight = Dimensions.get('window').height;

var language_radio_props = [[{label: 'Svenska', value: 0}, {label: 'Engelska', value: 1}], [{label: 'Swedish', value: 0}, {label: 'English', value: 1}]];

export default class SignIn extends Component {
	static navigationOptions = {
		header: null,
	};

	constructor(props) {
        super(props);
        
        this.state = {
            isReady: false,
            email: '',
            password: '',
            checkTermsAndConditions: false,

            showModal: false,

            showIndicator: false,

            selected_language: 1,////if 0 then Sweden, if 1 then English

            isSplashScreen: true,

            notification_id: -1,
            currentAppState: AppState.currentState,
            previous_app_state: 'kill'
            
        };

        ////////////   Onesignal  initialization   //////////////////
        ///////////////// OneSignal.setRequiresUserPrivacyConsent(requiresConsent);

        OneSignal.init("0d145cec-59ba-47c8-b227-0353af5a576b", {kOSSettingsKeyAutoPrompt : true});

        OneSignal.configure();

        OneSignal.enableVibrate(true);
        OneSignal.enableSound(true);

    };
    
    initLanguage() {
        // this.backButtonListener = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton.bind(this));
        Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT);
        this.setState({selected_language: Global.language});

        dBase.transaction(tx => {
			tx.executeSql(
				`select * from items where 1`,
				null,
				(_, { rows: { _array } }) => {
                    // self.processdBaseData(_array)
                    if(_array.length > 0) {
                        this.setState({
                            email: _array[0].email,
                            password: _array[0].password
                        });
                        console.log(_array[0].email + '::::' + _array[0].password);
                    } 
                },
			);
        });

    }

 
    componentDidMount() {
        this.props.navigation.addListener('willFocus', this.initLanguage.bind(this));

        OneSignal.setLocationShared(true);
       
        OneSignal.inFocusDisplaying(2)

        this.onReceived = this.onReceived.bind(this);
        this.onOpened = this.onOpened.bind(this);
        this.onIds = this.onIds.bind(this);

        OneSignal.addEventListener('received', this.onReceived);
        this.oneSignalEventListener = OneSignal.addEventListener('opened', this.onOpened);
        OneSignal.addEventListener('ids', this.onIds);

        AppState.addEventListener('change', this._handleAppStateChange);

        // console.log(this.state.currentAppState + ':::::');
        
    };

    _handleAppStateChange = (nextAppState) => {
    //    console.log(this.state.currentAppState + ':llll:' + nextAppState);
       this.setState({
           currentAppState: nextAppState,
        });
    }

    onReceived(notification) {
        // console.log("Notification received: ", notification);

    };

    onOpened(openResult) {
        var notification_id = openResult.notification.payload.additionalData.notification_id;
        console.log(notification_id + 'oooooooooooo');
        // if(Global.currentScreen === 'ShowNotification') {
        //     // console.log(notification_id + 'oooooo');
        //     // this.props.navigation.navigate('Home', {notification_id: notification_id});
        // } else if(this.state.currentAppState === 'background' || this.state.previous_app_state === 'active') {
        //     console.log('ddddd');
        //     this.props.navigation.navigate('ShowNotification', {notification_id: notification_id, backButtonAction: false});
            
        // } else {
        //     this.setState({
        //         notification_id: notification_id,
        //     });
        // }
        this.setState({
            notification_id: notification_id,
        });
    }

    onIds(device) {
        // console.log('Device info: ', device);
        // console.log('Device useid: ', device.userId);
        // alert(device.userId);
        Global.notification_token = device.userId;
    }

    async componentWillMount() {

        await Expo.Font.loadAsync({
            coreSansLight: CoreSnasCRLight,
            coreSansRegular: CoreSnasCRRegular,
            coreSansBold: CoreSnasCRBold,
        });
        this.setState({isReady: true});

        //// get countries 
        if(Global.countries.length === 0) {
            fetch('https://safetyzonemessage.com/api/auth/country/all', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    // 'Authorization': 'Bearer ' + Global.token,
                },
                body: JSON.stringify({
                })
            })
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                if(data.status === 'fail') {
                    if(this.state.selected_language === 1) {
                        Alert.alert('Please notice!', 'Network error.');
                    } else {
                        Alert.alert('Observera!', 'Network error.');
                    }
                } else if(data.status === 'success'){

					Global.countries = data.countries;
                }
                
            })
            .catch(function(error) {
				console.log('Network error countryyyyyy');
                Alert.alert('Please notice!', 'Network error.');
            })
		}

        dBase.transaction(tx => {
			tx.executeSql(
				'create table if not exists items (id integer primary key not null, email text, password text, login integer);'
			);
		});
		dBaseLanguage.transaction(tx => {
			tx.executeSql(
				'create table if not exists items (id integer primary key not null, language integer);'
			);
		});
		dBaseAlarm.transaction(tx => {
			tx.executeSql(
				'create table if not exists items (id integer primary key not null, alarm_sound_index integer, alarm_vibration_action integer);'
			);
        });
        
        
        //disable splashscreen
        setTimeout(async() => {
            await this.initialSetting();
            // this.setState({isSplashScreen: false});
        }, 3000);
    };

    
    getCameeraPermission = async() => {
        const permissionGallery = await Permissions.getAsync(Permissions.CAMERA_ROLL);
        if (permissionGallery.status !== 'granted') {
            const newPermission = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (newPermission.status === 'granted') {
                //its granted.
                console.log("camera roll granted");
            }
        } else {
            console.log("camera roll granted from getAsync");
        }

        const permissionCamera = await Permissions.getAsync(Permissions.CAMERA);
        if (permissionCamera.status !== 'granted') {
            const newPermission = await Permissions.askAsync(Permissions.CAMERA);
            if (newPermission.status === 'granted') {
                //its granted.
                console.log("camera granted");
            }
        } else {
            console.log("camera granted from getAsync");
        }
    }

    initialSetting = async() => {
        this.setState({showIndicator: true});

        //read revious setting from SQLite
        self = this;

        dBaseLanguage.transaction(tx => {
            tx.executeSql(
                `select * from items where 1`,
                null,
                (_, { rows: { _array } }) => self.setLanguage(_array),
            );
        });

        dBaseAlarm.transaction(tx => {
            tx.executeSql(
                `select * from items where 1`,
                null,
                (_, { rows: { _array } }) => self.setAlarmAction(_array),
            );
        });

		dBase.transaction(tx => {
			tx.executeSql(
				`select * from items where 1`,
				null,
				(_, { rows: { _array } }) => self.processdBaseData(_array),
			);
        });
    };

    setLanguage = (item) => {
		// console.log(item);
		if(item.length > 0) {
			var lang = parseInt(item[0].language, 10);
            Global.language = lang;
            this.setState({selected_language: lang});
		}
	};

	setAlarmAction = (item) => {
		if(item.length > 0) {
            var alarm_sound_index = parseInt(item[0].alarm_sound_index, 10);
            var alarm_vibration_action = parseInt(item[0].alarm_vibration_action, 10);
            Global.alarm_vibration_action = alarm_vibration_action;
            Global.alarm_sound_index = alarm_sound_index;
            
            // console.log('[[[]]' + Global.alarm_sound_index + '::::' + Global.alarm_vibration_action + 'ppppp');

        };
        
    };

    sendSoundAndVibrationType = async(sound, vibration) => {
        var sound_name = '';
        if(sound === 0) {
            sound_name = 'sound1';
        } else if(sound === 1) {
            sound_name = 'sound2';
        } else if(sound === 2) {
            sound_name = 'no_sound';
        }
        self = this;
        await fetch('https://safetyzonemessage.com/api/push_effect', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + Global.token,
                },
                body: JSON.stringify({
                    'sound': sound_name,
                    'vibration': vibration
                })
            })
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                
            })
            .catch(function(error) {
                
            })
    }

    processdBaseData = async(item) => {
		// console.log(item);
		if(item.length > 0) {
			var email = item[0].email;
            var password = item[0].password;
            var login = item[0].login;
            this.setState({
                email: email,
                password: password,
            });
            if(login === 1) {
                self = this;
                await fetch('https://safetyzonemessage.com/api/auth/login', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            'email': email,
                            'password': password,
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        // console.log(data);
                        
                        //////  sign in propcess
                        self.setState({
                            isVisible : false,
                        });
                        if(data.status === 'fail') {
                            self.props.navigation.navigate('SignIn');
                        } else if(data.status === 'success'){
                            Global.token = data.token;
                            if(data.user[0].profile.is_admin === '1') {
                                Global.group_manager = true;
                            } else {
                                Global.group_manager = false;
                            }
                            Global.group_id = data.user[0].profile.group_id;
                            Global.fullname = data.user[0].profile.full_name;
                            Global.address = data.user[0].profile.street_address;
                            Global.current_email = email;
                            Global.current_password = password;

                            /////  send push notification token to server
                            self.sendOnesignalNotificationToken();

                            /////   send sound and vibration type to server
                            self.sendSoundAndVibrationType(Global.alarm_sound_index, Global.alarm_vibration_action);

                            ////get camera permission
                            self.getCameeraPermission();

                            // self.oneSignalEventListener.remove();
                            self.setState({previous_app_state: 'active'});
                            if(self.state.notification_id === -1) {
                                self.props.navigation.navigate('Home', {notification_id: -1});
                            } else {
                                self.props.navigation.navigate('ShowNotification', {notification_id: self.state.notification_id});
                            };
                            
                        }
                        
                    })
                    .catch(function(error) {
                        self.setState({isVisible : false});
                        self.props.navigation.navigate('SignIn');
                        if(this.state.selected_language === 1) {
                            Alert.alert('Please notice!', 'Network error.');
                        } else {
                            Alert.alert('Observera!', 'Network error.');
                        }
                    })
            } 
			
		} 
        
        this.setState({
            isSplashScreen: false,
            showIndicator: false
        });
    }
    

    selectLanguage = (value) => {
        // console.log(value + '  llll');
        this.setState({selected_language: value}); 
        Global.language = value;
        dBaseLanguage.transaction(
            tx => {
              tx.executeSql('delete from items where 1');
              
            },
            null,
        );
        dBaseLanguage.transaction(
            tx => {
                tx.executeSql('insert into items (language) values (?)', [value]);
                
            },
            null,
        );
    }

    handleEmail = (typedText) => {
        this.setState({email: typedText});
    };

    handlePassword = (typedText) => {
        this.setState({password: typedText});
    };
    

    sendOnesignalNotificationToken = async() => {
        fetch('https://safetyzonemessage.com/api/push_token', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + Global.token,
                },
                body: JSON.stringify({
                    'push_token': Global.notification_token,
                    'os_type': Platform.OS
                })
            })
            .then(response => response.json())
            .then(data => {
                // console.log(data);
            })
            .catch(function(error) {
                console.log('fffffffff::');
                // self.setState({showIndicator: false});
                // Alert.alert('Please notice!', 'Network errorrrrr.');
            })
    }

    signIn = async() => {

        Keyboard.dismiss();

        if(this.state.email === '') {
            if(this.state.selected_language === 1) {
                Alert.alert('Please notice!', 'The Email is required.');
            } else {
                Alert.alert('Observera!', 'Fyll i giltig Epost adress.');
            }
            return;
        }
        if(this.state.password === '') {
            if(this.state.selected_language === 1) {
                Alert.alert('Please notice!', 'The Password is required.');
            } else {
                Alert.alert('Observera!', 'Fyll i Lösenord.');
            }
            
            return;
        };
        if(this.state.password.length < 6) {
            if(this.state.selected_language === 1) {
                Alert.alert('Please notice!', 'The Password must be at least 6 characters.');
            } else {
                Alert.alert('Observera!', 'Lösenordet måste vara minst 6 tecken.');
            }
            
            return;
        };

        var email_origin = this.state.email;
        var email_trim = email_origin.trim();

        this.setState({showIndicator: true});
        self = this;
        await fetch('https://safetyzonemessage.com/api/auth/login', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'email': email_trim,
                    'password': self.state.password,
                })
            })
            .then(response => response.json())
            .then(data => {
                // console.log(data);

                //////  sign in propcess
                // self.setState({showIndicator: false});
                if(data.status === 'fail') {
                    if(self.state.selected_language === 1) {
                        Alert.alert("Please notice!", 'Email or Password is incorrect!');
                    } else {
                        Alert.alert("Observera!", 'Email eller lösenord är felaktigt!');
                    }
                } else if(data.status === 'success'){
                    Global.token = data.token;
                    if(data.user[0].profile.is_admin === '1') {
                        Global.group_manager = true;
                    } else {
                        Global.group_manager = false;
                    }
                    Global.group_id = data.user[0].profile.group_id;
                    Global.fullname = data.user[0].profile.full_name;
                    Global.address = data.user[0].profile.street_address;
                    Global.current_email = email_trim;
                    Global.current_password = self.state.password;
                    
                    var email_db = email_trim;
                    var password_db = self.state.password;
                    // console.log(self.state.email + '  ' + self.state.password);
                    dBase.transaction(
                        tx => {
                          tx.executeSql('delete from items where 1');
                          
                        },
                        null,
                    );
                    dBase.transaction(
                        tx => {
                            tx.executeSql('insert into items (email, password, login) values (?, ?, 1)', [email_db, password_db]);
                        },
                        null,
                    );
                    dBaseAlarm.transaction(
                        tx => {
                            tx.executeSql('insert into items (alarm_sound_index, alarm_vibration_action) values (0, 1)');
                            // tx.executeSql('insert into items (email, password) values (?, ?)', [email_db, password_db]);
                            
                        },
                        null,
                    );

                    // /////  send push notification token to server
                    self.sendOnesignalNotificationToken();

                    /////   send sound and vibration type to server
                    self.sendSoundAndVibrationType(Global.alarm_sound_index, Global.alarm_vibration_action);

                    ////get camera permission
                    self.getCameeraPermission();
                    
                    self.setState({previous_app_state: 'active'});

                    if(Global.language === 0) {
                        self.sendLanguageSetting('swedish');
                    } else if(Global.language === 1) {
                        self.sendLanguageSetting('english');
                    };

                    this.props.navigation.navigate('Home');
                }
                
            })
            .catch(function(error) {
                // self.setState({showIndicator: false});
                Alert.alert('Please notice!', 'Network error.');
            });
        
        this.setState({showIndicator: false});
        
    };

    sendLanguageSetting = async(language) => {
        await fetch('https://safetyzonemessage.com/api/language', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + Global.token,
                },
                body: JSON.stringify({
                    'language': language
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                
            })
            .catch(function(error) {
                console.log('aaaaaaaaa   ');
            })
    };

    createUser = () => {
        if(this.state.checkTermsAndConditions) {
            // this.backButtonListener.remove();
            this.props.navigation.navigate('CreateProfile');
        } else {
            if(this.state.selected_language === 1) {
                Alert.alert('Please notice!', 'Please check Terms and Conditions');
            } else {
                Alert.alert('Observera!', 'Godkänn våra användarvillkor');
            }
        }
        
    };

    forgotPassword = () => {
        // this.backButtonListener.remove();
        this.props.navigation.navigate('ForgotPassword');
    };

    showTerms_Conditions = () => {
        // this.backButtonListener.remove();
        this.props.navigation.navigate('TermsAndConditions');
    };

    checkTermsAndConditions = () => {
        this.setState({checkTermsAndConditions: !this.state.checkTermsAndConditions});
    }

    getGroupID = () => {

        this.setState({showModal: true});
    }
    
    render() {
        if (!this.state.isReady) {
            return <Expo.AppLoading/>;
        }
        if(this.state.isSplashScreen) {
            return (
                <View style={styles.containerSplash}>
                    {
                        this.state.showIndicator &&
                        <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', opacity: 0.5, zIndex: 100}}>
                            <View style = {{flex: 1}}>
                                <BallIndicator color = '#ffffff' size = {50} count = {8}/>
                            </View>
                        </View>
                    }
                    {
                        <View style = {{width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                            <Image style = {styles.logostyle} resizeMode = {'contain'} source = {require('../assets/images/splash_logo.png')}/>
                        </View> 
                    }
                </View>
            );
        } else {
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
                    <View style = {styles.top_section}>
                        {/* <ImageBackground style = {{width: '100%', height: '100%', alignItems: 'center'}} resizeMode = {'stretch'} source = {require('../assets/images/top_head.png')}> */}
                            <Text style = {styles.title_text}> {this.state.selected_language === 0 ? 'Logga in' : 'Sign in'} </Text>
                        {/* </ImageBackground> */}
                    </View>
                    <View style = {styles.marker_view}>
                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {require('../assets/images/logo_blue.png')}/>
                    </View>
                    <View style = {styles.main_section}>
                        <View style = {{width: '100%', height: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}>
                            <TouchableOpacity style = {{height: '100%', aspectRatio: 1.6, marginRight: 20}} onPress = {() => this.selectLanguage(0)}>
                                <Image style = {[{width: '100%', height: '100%'}, (this.state.selected_language === 1) ? {opacity: 0.3} : null]} resizeMode = {'stretch'} source = {require('../assets/images/sweden_flag.png')}/>
                            </TouchableOpacity>
                            <TouchableOpacity style = {{height: '100%', aspectRatio: 1.6, marginRight: 15}}  onPress = {() => this.selectLanguage(1)}>
                                <Image style = {[{width: '100%', height: '100%'}, (this.state.selected_language === 0) ? {opacity: 0.3} : null]} resizeMode = {'stretch'} source = {require('../assets/images/british_flag.png')}/>
                            </TouchableOpacity>
                        </View>
                        <View style = {styles.inputbox} onStartShouldSetResponder = {() => {this.refs.email_ref.focus();}}>
                            <View style = {{width: '10%', height: '45%', alignItems: 'center', justifyContent: 'center'}}>
                                <Image style = {styles.icon} resizeMode = 'contain' source = {require('../assets/images/email_white.png')}/>
                            </View>
                            <View style = {{width: '90%', height: '80%', justifyContent: 'center'}}>
                                <TextInput underlineColorAndroid = 'transparent' style = {styles.input_content} keyboardType={Platform.OS === 'android' ? 'email-address' : 'ascii-capable'} ref = 'email_ref' placeholder = {this.state.selected_language === 0 ? 'Epost' : 'Email'} placeholderTextColor = '#808080' onChangeText = {this.handleEmail}>{this.state.email}</TextInput>
                            </View>
                        </View>
                        <View style = {styles.inputbox} onStartShouldSetResponder = {() => {this.refs.password_ref.focus();}}>
                            <View style = {{width: '10%', height: '70%', alignItems: 'center', justifyContent: 'center'}}>
                                <Image style = {styles.icon} resizeMode = 'contain' source = {require('../assets/images/password_white.png')}/>
                            </View>
                            <View style = {{width: '90%', height: '80%', justifyContent: 'center'}}>
                                <TextInput underlineColorAndroid = 'transparent' secureTextEntry={true} style = {styles.input_content} ref = 'password_ref' placeholder = {this.state.selected_language === 0 ? 'Lösenord' : 'Password'} placeholderTextColor = '#808080' onChangeText = {this.handlePassword}>{this.state.password}</TextInput>
                            </View>
                        </View>
                        <View style = {styles.signin_button_view}>
                            <TouchableOpacity style = {styles.signin_button} onPress = {() => this.signIn()}>
                                <Text style = {{color: '#ffffff', fontSize: 15, fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 7}}> {this.state.selected_language === 0 ? 'Logga in' : 'Sign in'} </Text>
                            </TouchableOpacity>
                        </View>
                        <View style = {styles.forgot_view}>
                            <TouchableOpacity onPress = {() => this.forgotPassword()}>
                                <Text style = {{marginLeft: 10, color: '#ffffff', fontSize: 12, fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}>{this.state.selected_language === 0 ? 'Glömt lösenord' : 'Forgot Password'}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style = {[styles.signin_button_view, {position: 'absolute', bottom: '30%'}]}>
                            <TouchableOpacity style = {[styles.signin_button, {backgroundColor: '#3670eb'}]} onPress = {() => this.getGroupID()}>
                                <Text style = {{color: '#ffffff', fontSize: 15, fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 7}}> {this.state.selected_language === 0 ? 'Kom igång' : 'Get Started'} </Text>
                            </TouchableOpacity>
                        </View>

                        <View style = {[styles.signin_button_view, {position: 'absolute', bottom: '15%'}]}>
                            <TouchableOpacity style = {[styles.signin_button, {backgroundColor: '#3670eb'}]} onPress = {() => this.createUser()}>
                                <Text style = {{color: '#ffffff', fontSize: 15, fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 7}}> {this.state.selected_language === 0 ? 'Skapa profil' : 'Create Profile'} </Text>
                            </TouchableOpacity>
                        </View>

                        <View style = {{width: '100%', alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row', position: 'absolute', bottom: '2%'}}>
                            <TouchableOpacity onPress = {() => this.showTerms_Conditions()}>
                                <Text  style = {{color: '#ffffff', fontSize: 12, fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}>{this.state.selected_language === 0 ? 'Godkänn användaravtal' : 'Terms and Conditions'}</Text>
                            </TouchableOpacity>
                            <View style = {{width: 10}}></View>
                            <TouchableOpacity onPress = {() => this.checkTermsAndConditions()}>
                            {
                                this.state.checkTermsAndConditions &&
                                <Image style = {{width: 20, height: 20}} resizeMode = 'contain' source = {require('../assets/images/checkbox.png')}/>
                            }
                            {
                                !this.state.checkTermsAndConditions &&
                                <Image style = {{width: 20, height: 20}} resizeMode = 'contain' source = {require('../assets/images/uncheckbox.png')}/>
                            }
                            </TouchableOpacity>
                            <View style = {{width: 20}}></View>
                        </View>


                    </View>
                    {/* <View style = {styles.banner_section}>
                    </View> */}
                    <Modal isVisible = {this.state.showModal} style = {styles.modal} onBackButtonPress = {() => this.setState({showModal: false})}>
                        <View style = {styles.modalContainer}>
                            <View style = {{width: '90%', height: '70%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', borderRadius: 10, overflow: 'hidden'}}>
                                <View style = {{width: '100%', height: '15%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#426af1',}}>
                                    <Text style = {{fontSize: 20, fontFamily: 'coreSansBold', color: '#ffffff', paddingTop: Platform.OS === 'android' ? 0 : 10}}>{this.state.selected_language === 0 ? 'Kom igång' : 'Get started'}</Text>
                                </View>
                                <View style = {{width: '100%', height: '65%', alignItems: 'center'}}>
                                    <ScrollView style = {{width: '95%', height: '100%'}}>
                                        <Text style = {{marginBottom: 10, marginTop: 10, fontSize: 15, fontFamily: 'coreSansLight', paddingTop: Platform.OS === 'android' ? 0 : 7}}>
                                            {this.state.selected_language === 0 
                                            ? '1. Om du är ny användare och din förening / samfällighet har blivit tilldelat ett Grupp-ID trycker du på knappen Ny Användare för att skapa din personliga profil.”'
                                            : '1. If you are a new user and have been assigned a Group-ID please press the Create Profile button and create your personal profile.'}
                                        </Text>
                                        <Text style = {{marginBottom: 10, fontSize: 15, fontFamily: 'coreSansLight', paddingTop: Platform.OS === 'android' ? 0 : 7}}>
                                            {this.state.selected_language === 0 
                                            ? '2. Redan registrerade användare med en personlig profil loggar in genom att fylla i sin Epost och lösenord.'
                                            : '2. If you already have a personal profile please enter your Email and Password and press the Sign in button.'}
                                        </Text>
                                        {
                                            this.state.selected_language === 0 &&
                                            <Autolink
                                                text = '3. Är du intresserad av att ansluta er förening / samfällighet helt gratis till Safety Zones Grannsamverkan app? Besök oss på: www.safety-zone.se'
                                                style = {{fontSize: 15, fontFamily: 'coreSansLight', paddingTop: Platform.OS === 'android' ? 0 : 7}}
                                            />
                                        }
                                        {
                                            this.state.selected_language === 1 &&
                                            <Autolink
                                                text = '3. Are you interested in joining your community to Safety Zone Neighborhood Watch App completely free of charge? Please visit us at: www.safety-zone.se'
                                                style = {{fontSize: 15, fontFamily: 'coreSansLight', paddingTop: Platform.OS === 'android' ? 0 : 7}}
                                            />
                                        }
                                    </ScrollView>

                                </View>
                                <View style = {{width: '100%', height: '20%', alignItems: 'center', justifyContent: 'center'}}>
                                    <TouchableOpacity style = {{width: '60%', height: '50%', backgroundColor: '#ff4858', borderRadius: 40, alignItems: 'center', justifyContent: 'center'}} onPress = {() => {this.setState({showModal: false})}}>
                                        <Text style = {{color: '#ffffff', fontSize: 15, fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 7}}>OK</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            );
        }
    }

}

const styles = StyleSheet.create({
    containerSplash: {
		flex: 1,
		backgroundColor: '#ffffff',
		alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: '#212749'

    },
    logostyle: {
		width: '70%',
		height: 100,
		// resizeMode: 'stretch',
		// marginBottom: 200,
	},
	container: {
		flex: 1,
		backgroundColor: '#392b59',
		alignItems: 'flex-start',
        // justifyContent: 'center',
        // zIndex: 20,
        
    },
    top_section: {
        width: '100%',
        height: 120,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        overflow: 'hidden',
        backgroundColor: '#4567f2',
        alignItems: 'center'
    },
    marker_view: {
        position: 'absolute',
        zIndex: 10,
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
        fontFamily: 'coreSansBold'
        
    },
    main_section: {
        width: '100%',
        height: deviceHight - 120 - 60 - deviceHight * 0.1,
        // backgroundColor: '#555555',
        marginTop: 60,
    },
    inputbox: {
        // width: '100%',
        height: 30,
        flexDirection: 'row',
        marginLeft: 10,
        marginRight: 10,
        borderBottomColor: '#6e1ced',
        borderBottomWidth: 1,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    icon: {
        width: '100%',
        height: '100%',
    },
    input_title: {
        // width: '20%',
        // height: '100%',
        fontSize: 15,
        color: '#ffffff',
        fontFamily: 'coreSansBold',
        paddingTop: Platform.OS === 'android' ? 0 : 7
    },
    input_content: {
        // width: '70%',
        // height: '100%',
        fontSize: 15,
        color: '#ffffff',
        fontFamily: 'coreSansBold',
        paddingTop: Platform.OS === 'android' ? 0 : 7
    },
    signin_button_view: {
        width: '100%',
        height: '10%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    signin_button: {
        width: '60%',
        height: '100%',
        backgroundColor: '#ff4858',
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    forgot_view: {
        width: '100%',
        // height: 30,
        alignItems: 'flex-start',
        justifyContent: 'center',
        marginTop: 20,
    },
    forgot_button: {
        // width: 150, 
        // height:'100%', 
        // borderBottomColor: '#ffffff', 
        // borderBottomWidth: 1, 
        justifyContent: 'center', 
        alignItems: 'flex-start', 
        marginLeft: 10
    },
    banner_section: {
        position: 'absolute',
        width: '100%',
        height: '10%',
        bottom: 0,
        backgroundColor: '#666665',
    },
    modal: {
        // width: '60%',
        // height: '60%',
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: 'white',
    },
    modalContainer: {
        // width: deviceWidth * 0.9,
        // height: deviceHight * 0.9,
        width: '95%',
        height: '95%',
        // backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
    },
    
});