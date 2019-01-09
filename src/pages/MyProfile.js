
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
    KeyboardAvoidingView,
    WebView,
    Linking,
 } from 'react-native';

import {Font, Constants, SQLite} from 'expo';
import { ImagePicker, Permissions, DocumentPicker, ImageManipulator } from 'expo';

import Modal from 'react-native-modal';

import OneSignal from 'react-native-onesignal'; // Import package from node modules
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from '../components/radiobutton/RadioButton';
import { BallIndicator } from 'react-native-indicators';

import Global, {
    CoreSnasCRLight,
    CoreSnasCRRegular,
    CoreSnasCRBold,
} from '../Global/Global'

const dBase = SQLite.openDatabase('dBase.db');
const dBaseLanguage = SQLite.openDatabase('dBaselanguage.db');
const dBaseAlarm = SQLite.openDatabase('dBasealarm4.db');

var deviceWidth = Dimensions.get('window').width;
var deviceHight = Dimensions.get('window').height;
var bannerHeight = deviceHight * 0.1;
var topSectionHeight = 120;
var mainSectionHeight = deviceHight - (topSectionHeight + bannerHeight + 40); 
var componentHeight = (deviceWidth - 30) / 2;

var language_radio_props = [[{label: 'Svenska', value: 0}, {label: 'Engelska', value: 1}], [{label: 'Swedish', value: 0}, {label: 'English', value: 1}]];
var vibration_radio_props = [[{label: 'Av', value: 0}, {label: 'På', value: 1}], [{label: 'Off', value: 0}, {label: 'On', value: 1}]];
var custom_sound = [['Notisljud 1', 'Notisljud 2', 'Tyst'], ['Sound 1', 'Sound 2', 'No sound']];

export default class MyProfile extends Component {
	static navigationOptions = {
		header: null,
	};

	constructor(props) {
        super(props);
        
        this.state = {
            isReady: false,
            image_uri: '',
            user_name: '',
            user_email: '',
            user_phonenumber: '',

            select_language_flag: false,
            select_password_flag: false,
            select_groupid_flag: false,
            select_notificationaction_flag: false,
            select_terms_flag: false,
            select_policy_flag: false,
            select_help_flag: false,
            delete_accout_flag: false,
            signout_flag: false,

            customSoundName: Global.alarm_sound_name,
            customSoundUri: Global.alarm_sound_uri,

            selected_language: 1,////if 0 then Sweden, if 1 then English

            main_groupid: '',
            other_groupids: [],

            select_customsound_flag: false,
            selected_customsound: Global.alarm_sound_index,
            select_vibration_flag: false,
            vibration_option: Global.alarm_vibration_action,// if 0 then vibratin off, 1 then vibration on
            disable_vibrationClickable: true,

            newGroupID: '',

            old_password: '',
            new_password: '',
            confirm_password: '',

            showIndicator: false,

            ads_image: '',
            ads_link: '',
            ads_id: -1,

        };

        // this.deleteAccount = this.deleteAccount.bind(this);
    };

    initLanguage() {
        Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT);
        this.setState({
            selected_language: Global.language,
            selected_customsound: Global.alarm_sound_index
        });

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
    }

    async componentWillMount() {

        await Expo.Font.loadAsync({
            coreSansLight: CoreSnasCRLight,
            coreSansRegular: CoreSnasCRRegular,
            coreSansBold: CoreSnasCRBold,
        });
        this.setState({isReady: true});

        if(this.state.selected_customsound === 2) {
            this.setState({disable_vibrationClickable: false});
        } else {
            this.setState({disable_vibrationClickable: true});
        };

        if(Platform.OS === 'android') {
            this.setState({disable_vibrationClickable: false});
        }

        this.setState({showIndicator: true});
        self = this;
        await fetch('https://safetyzonemessage.com/api/profile', {
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
                    if(self.state.selected_language === 1) {
                        Alert.alert("Please notice!", 'There is something wrong in server.');
                    } else if(self.state.selected_language === 0) {
                        Alert.alert("Observera!", 'Något är fel med servern.');
                    }
                } else if(data.status === 'success'){
                    self.setState({
                        image_uri: data.avatar,
                        user_name: data.first_name + ' ' + data.family_name,
                        user_email: data.email,
                        user_phonenumber: data.phone_number
                    });
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
        
		// BackHandler.addEventListener('hardwareBackPress', () => {return true});
		// Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT);
        // StatusBar.setHidden(true);

        // alert(deviceHight + " " + mainSectionHeight + " " + topSectionHeight + " " + bannerHeight);
        
    };

    goHome = () => {
        this.setState({ads_image: ''});
        this.props.navigation.navigate('Home');
        // alert("5555555");
    };

    uploadAvatar = async(avatar_uri) => {
        var formData = new FormData();
        let localUri = avatar_uri;
        let localUriNamePart = localUri.split('/');
        const fileName = localUriNamePart[localUriNamePart.length - 1];
        let localUriTypePart = localUri.split('.');
        const fileType = localUriTypePart[localUriTypePart.length - 1];

        formData.append('avatar', {
            uri: avatar_uri,
            name: fileName,
            type: `image/${fileType}`,
        })

        this.setState({showIndicator: true});
        self = this;
        await fetch('https://safetyzonemessage.com/api/change-avatar', {
                method: 'POST',
                headers: {
                    // 'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                    'Authorization': 'Bearer ' + Global.token,
                },
                body: formData
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
                    if(self.state.selected_language === 1) {
                        Alert.alert("Notice!", 'Avatar has changed successfully.');
                    } else if(self.state.selected_language === 0) {
                        Alert.alert("Observera!", 'Du har nu bytt profilbild.');
                    }
                    
                    self.setState({ image_uri: avatar_uri });
                }
            })
            .catch(function(error) {
                // console.log("Network errorrrrrrrrrrrrr");
                if(self.state.selected_language === 1) {
                    Alert.alert('Please notice!', 'Network error.');
                } else if(self.state.selected_language === 0) {
                    Alert.alert('Observera!', 'Nätverksproblem.');
                }
            })

        this.setState({showIndicator: false});

    };
    
    takePhotoFromGallery = async() => {
        
        let result = await Expo.ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            width: '100%',
            height: '100%',
            aspect: [1, 1],
        });
 
        if (!result.cancelled) {

            this.setState({showIndicator: true});
            var resizedPhoto;
            if((result.width < result.height)) {
                resizedPhoto = await ImageManipulator.manipulate(result.uri, [{ resize: { height: 512 }}], { format: 'jpeg', compress: 0.5});
            } else if((result.width >= result.height)) {
                resizedPhoto = await ImageManipulator.manipulate(result.uri, [{ resize: { width: 512 }}], { format: 'jpeg', compress: 0.5});
            } else {
                resizedPhoto = result;
            }

            self = this;
            setTimeout(function(){
                self.setState({showIndicator: false});
                self.uploadAvatar(resizedPhoto.uri);
            }, 2000);
        }
        
    };

    takePhotoFromCamera = async() => {
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            width: '100%',
            height: '100%',
            aspect: [1, 1],
        });

        if (!result.cancelled) {

            this.setState({showIndicator: true});
            var resizedPhoto;
            if((result.width < result.height)) {
                resizedPhoto = await ImageManipulator.manipulate(result.uri, [{ resize: { height: 512 }}], { format: 'jpeg', compress: 0.5});
            } else if((result.width >= result.height)) {
                resizedPhoto = await ImageManipulator.manipulate(result.uri, [{ resize: { width: 512 }}], { format: 'jpeg', compress: 0.5});
            } else {
                resizedPhoto = result;
            }

            self = this;
            setTimeout(function(){
                self.setState({showIndicator: false});
                self.uploadAvatar(resizedPhoto.uri);
            }, 2000);
        }
    };

    showLanguages = () => {
        this.setState({select_language_flag: !this.state.select_language_flag});
        dBaseLanguage.transaction(
            tx => {
              tx.executeSql('delete from items where 1');
              
            },
            null,
        );
    };

    selectLanguage = async(value) => {
        // console.log(value + 'llll');
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
        if(value === 0) {
            await this.sendLanguageSetting('swedish');
        } else if(value === 1) {
            await this.sendLanguageSetting('english');
        }
    };

    sendLanguageSetting = async(language) => {
        console.log(language + 'dddd');
        await fetch('https://safetyzonemessage.com/api/language ', {
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
                console.log(error);
            })
    };

    showPasswordView = () => {
        this.setState({select_password_flag: !this.state.select_password_flag});
        // alert(';;;' + Global.notification_token + ':::');
    };

    changePassword = async() => {
        // console.log(this.state.old_password + ':::' + this.state.new_password + ':::' + this.state.confirm_password);
        if(this.state.old_password === '') {
            if(this.state.selected_language === 1) {
                Alert.alert('Please notice!', 'Please insert current password.');
            } else {
                Alert.alert('Observera!', 'Var god skriv in ditt nuvarande lösenord.');
            }
            return;
        }
        if(this.state.old_password != Global.current_password) {
            if(this.state.selected_language === 1) {
                Alert.alert('Please notice!', 'Please insert correct password.');
            } else {
                Alert.alert('Observera!', 'Var god skriv in rätt lösenord.');
            }
            
            return;
        }
        if(this.state.new_password != this.state.confirm_password) {
            if(this.state.selected_language === 1) {
                Alert.alert('Please notice!', 'Password does not match. Please try again.');
            } else {
                Alert.alert('Observera!', 'Lösenorden matchar inte, försök igen.');
            }
            
            return;
        }
        if(this.state.new_password.length < 6) {
            if(this.state.selected_language === 1) {
                Alert.alert('Please notice!', 'The Password must be at least 6 characters.');
            } else {
                Alert.alert('Observera!', 'Lösenordet måste vara minst 6 tecken.');
            }
            
            return;
        }

        this.setState({showIndicator: true});
        self = this;
        await fetch('https://safetyzonemessage.com/api/change-password', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + Global.token,
                },
                body: JSON.stringify({
                    'password': self.state.new_password
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
                    if(self.state.selected_language === 1) {
                        Alert.alert("Notice!", 'The password has updated.');
                    } else {
                        Alert.alert("Observera!", 'Lösenordet har uppdaterats.');
                    }
                    self.setState({select_password_flag: false});
                }
            })
            .catch(function(error) {
                self.setState({showIndicator: false});
                if(self.state.selected_language === 1) {
                    Alert.alert('Please notice!', 'Network error.');
                } else if(self.state.selected_language === 0) {
                    Alert.alert('Observera!', 'Nätverksproblem.');
                }
            })

        this.setState({showIndicator: false});
    };

    showGroupIDs = async() => {
        
        if(this.state.select_groupid_flag) {
            self.setState({
                main_groupid: '',
                other_groupids: []
            });
            this.setState({select_groupid_flag: false});
            return;
        }
        this.setState({showIndicator: true});
        self = this;
        await fetch('https://safetyzonemessage.com/api/group/attached', {
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
                    self.setState({
                        main_groupid: data.main,
                        other_groupids: data.others
                    });
                    self.setState({select_groupid_flag: true});
                }
            })
            .catch(function(error) {
                self.setState({showIndicator: false});
                if(self.state.selected_language === 1) {
                    Alert.alert('Please notice!', 'Network error.');
                } else if(self.state.selected_language === 0) {
                    Alert.alert('Observera!', 'Nätverksproblem.');
                }
            })

        this.setState({showIndicator: false});
    };

    handleNewGroupID = (typedText) => {
        this.setState({newGroupID: typedText});
    }

    attachNewGroupID = async() => {
        if(this.state.newGroupID === '') {
            if(self.state.selected_language === 1) {
                Alert.alert('Please notice', 'Please insert new Group ID.');
            } else {
                Alert.alert('Observera', 'Please insert new Group ID.');
            }
            return;
        }
        this.setState({showIndicator: true});
        self = this;
        await fetch('https://safetyzonemessage.com/api/group/attach', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + Global.token,
                },
                body: JSON.stringify({
                    'group_id': self.state.newGroupID
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if(data.status === 'fail') {
                    if(data.error_type === 'no_group') {
                        if(self.state.selected_language === 1) {
                            Alert.alert("Please notice!", 'There is no Group ID.');
                        } else if(self.state.selected_language === 0) {
                            Alert.alert("Observera!", 'There is no Group ID.');
                        }
                    } else if(data.error_type === 'is_member') {
                        if(self.state.selected_language === 1) {
                            Alert.alert("Please notice!", 'You are already this group member.');
                        } else if(self.state.selected_language === 0) {
                            Alert.alert("Observera!", 'You are already this group member.');
                        }
                    }
                } else if(data.status === 'success'){
                    self.setState({
                        other_groupids: [...self.state.other_groupids, self.state.newGroupID]
                    });

                    self.setState({
                        newGroupID: ''
                    })
                }
            })
            .catch(function(error) {
                self.setState({showIndicator: false});
                if(self.state.selected_language === 1) {
                    Alert.alert('Please notice!', 'Network error.');
                } else if(self.state.selected_language === 0) {
                    Alert.alert('Observera!', 'Nätverksproblem.');
                }
            })

        this.setState({showIndicator: false});
    };

    deattachGroupID = async(index) => {
        this.setState({showIndicator: true});
        self = this;
        await fetch('https://safetyzonemessage.com/api/group/delete-attach', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + Global.token,
                },
                body: JSON.stringify({
                    'group_id': self.state.other_groupids[index]
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
                    var array = [...self.state.other_groupids];
                    array.splice(index, 1);
                    self.setState({other_groupids: array});
                }
            })
            .catch(function(error) {
                self.setState({showIndicator: false});
                if(self.state.selected_language === 1) {
                    Alert.alert('Please notice!', 'Network error.');
                } else if(self.state.selected_language === 0) {
                    Alert.alert('Observera!', 'Nätverksproblem.');
                }
            })

        this.setState({showIndicator: false});
    }

    showNotificationSound = () => {
        this.setState({
            select_notificationaction_flag: !this.state.select_notificationaction_flag,
        });
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
        this.setState({showIndicator: true});
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
                console.log(data);
                
            })
            .catch(function(error) {
                
            })

        this.setState({showIndicator: false});
    }

    selectCustomSound = async(index) => {
        // console.log('3333' + index);
        this.setState({selected_customsound: index});
        if(index === 2) {
            OneSignal.enableSound(false);
            console.log("no sound");

            this.setState({disable_vibrationClickable: false});
            
        } else {
            OneSignal.enableSound(true);
            this.setState({disable_vibrationClickable: true});
        };

        if(Platform.OS === 'android') {
            this.setState({disable_vibrationClickable: false});
        }

        ////   send sound type to server
        this.sendSoundAndVibrationType(index, this.state.vibration_option);

        Global.alarm_sound_index = index;
            // DB operation
        dBaseAlarm.transaction(
            tx => {
            tx.executeSql('delete from items where 1');
            },
            null,
        );
        dBaseAlarm.transaction(
            tx => {
                tx.executeSql('insert into items (alarm_sound_index, alarm_vibration_action) values (?, ?)', [index, this.state.vibration_option]);
            },
            null,
        );
    };

    showVibrationSetting = () => {
        this.setState({select_vibration_flag: !this.state.select_vibration_flag});
    };

    selectVibrationType = async(value) => {
        this.setState({vibration_option: value}); 

        if(value === 0) {
            OneSignal.enableVibrate(false);
            console.log("no vibration")
        } else {
            OneSignal.enableVibrate(true);
            console.log("vibration")
        }

        this.sendSoundAndVibrationType(this.state.selected_customsound, value);

        // DB operation
        dBaseAlarm.transaction(
            tx => {
            tx.executeSql('delete from items where 1');
            },
            null,
        );
        dBaseAlarm.transaction(
            tx => {
                tx.executeSql('insert into items (alarm_sound_index, alarm_vibration_action) values (?, ?)', [this.state.selected_customsound, value]);
            },
            null,
        );
    };

    showPrivacy_Policy = () => {
        this.setState({ads_image: ''});
        // this.setState({select_policy_flag: !this.state.select_policy_flag});
        this.props.navigation.navigate('PrivacyAndPolicy');
    };

    showHelp_Support = () => {
        this.setState({ads_image: ''});
        this.setState({select_help_flag: !this.state.select_help_flag});
    };

    initGlobal = () => {
        Global.token = '';
        // Global.countries = [];
        Global.group_manager = false;
        Global.current_email = '';
        Global.current_password = '';
        console.log("init Global");
    }

    deleteAccount = () => {
        this.setState({showIndicator: true});
        self = this;
        fetch('https://safetyzonemessage.com/api/delete-account', {
                method: 'DELETE',
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
                self.setState({showIndicator: false});
                if(data.status === 'fail') {
                    if(self.state.selected_language === 1) {
                        Alert.alert("Please notice!", 'There is something wrong in server.');
                    } else if(self.state.selected_language === 0) {
                        Alert.alert("Observera!", 'Något är fel med servern.');
                    }
                } else if(data.status === 'success'){
                    dBase.transaction(
                        tx => {
                          tx.executeSql('delete from items where 1');
                          
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
                    self.setState({ads_image: ''}); 
                    self.initGlobal(); 
                    self.props.navigation.navigate('SignIn');

                }
            })
            .catch(function(error) {
                self.setState({showIndicator: false});
                if(self.state.selected_language === 1) {
                    Alert.alert('Please notice!', 'Network error.');
                } else if(self.state.selected_language === 0) {
                    Alert.alert('Observera!', 'Nätverksproblem.');
                }
            })
    };

    signoutAccount = () => {
        this.setState({showIndicator: true});
        self = this;
        fetch('https://safetyzonemessage.com/api/logout', {
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
                self.setState({showIndicator: false});
                if(data.status === 'fail') {
                    if(self.state.selected_language === 1) {
                        Alert.alert("Please notice!", 'There is something wrong in server.');
                    } else if(self.state.selected_language === 0) {
                        Alert.alert("Observera!", 'Något är fel med servern.');
                    }
                } else if(data.status === 'success'){
                    // Alert.alert('Notice!', data.message,
                    // [
                    //     {text: 'OK', onPress: () => {self.setState({ads_image: ''}), self.initGlobal(), self.props.navigation.navigate('SignIn')}},
                    // ],
                    // { cancelable: true });
                    dBase.transaction(
                        tx => {
                          tx.executeSql('delete from items where 1');
                          
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
                    self.setState({ads_image: ''}); 
                    self.initGlobal(); 
                    self.props.navigation.navigate('SignIn');
                }
            })
            .catch(function(error) {
                self.setState({showIndicator: false});
                if(self.state.selected_language === 1) {
                    Alert.alert('Please notice!', 'Network error.');
                } else if(self.state.selected_language === 0) {
                    Alert.alert('Observera!', 'Nätverksproblem.');
                }
            })
    };

    showAlert = (string) => {
        const self = this;
        if (string === 'delete') {
            var message = '';
            if(this.state.selected_language === 0) {
                Alert.alert('Observera!', 'Vill du verkligen radera ditt konto?',
                [
                    {text: 'Avbryt', onPress: null},
                    {text: 'OK', onPress: () => self.deleteAccount()},
                ],
                { cancelable: true })
            } else {
                Alert.alert('Notice!', 'Do you really want to delete your account?',
                [
                    {text: 'Cancel', onPress: null},
                    {text: 'OK', onPress: () => self.deleteAccount()},
                ],
                { cancelable: true })
            };
            
        } else if(string === 'logout') {
            if(this.state.selected_language === 0) {
                Alert.alert('Observera!', 'Vill du verkligen logga ut?',
                [
                    {text: 'Avbryt', onPress: null},
                    {text: 'OK', onPress: () => self.signoutAccount()}
                ],
                { cancelable: true })
            } else {
                Alert.alert('Notice!', 'Do you really want to sign out?',
                [
                    {text: 'Cancel', onPress: null},
                    {text: 'OK', onPress: () => self.signoutAccount()}
                ],
                { cancelable: true })
            };
            
        };
    };

    handleOldPassword = (typedText) => {
        this.setState({old_password: typedText});
    };

    handleNewPassword = (typedText) => {
        this.setState({new_password: typedText});
    };

    handleConfirmPassword = (typedText) => {
        this.setState({confirm_password: typedText});
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
                        <Text style = {styles.title_text}> {this.state.selected_language === 1 ? 'My Profile' : 'Min profil'} </Text>
                    {/* </ImageBackground> */}
                </View>
                <View style = {styles.picture_view}>
                {
                    (this.state.image_uri === '') &&
                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/empty_picture.png')}/>
                }
                {
                    (this.state.image_uri !== '') &&
                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {{uri: this.state.image_uri}}/>
                }
                </View>
                <TouchableOpacity style = {styles.camera_view} onPress = {() => this.takePhotoFromCamera()}>
                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/myprofile_camera.png')}/>
                </TouchableOpacity>
                <TouchableOpacity style = {styles.gallery_view} onPress = {() => this.takePhotoFromGallery()}>
                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/myprofile_gallery.png')}/>
                </TouchableOpacity>
                
                <View style = {styles.main_section}>
                    <View style = {{width: '100%', height: 60, alignItems: 'center', justifyContent: 'center'}}>
                        <View style = {{width: '100%', height:'40%', alignItems: 'center', justifyContent: 'center'}}>
                            <Text style = {{fontSize: 15, color: '#ffffff', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 7}}>{this.state.user_name}</Text>
                        </View>
                        <View style = {{width: '100%', height:'30%', alignItems: 'center', justifyContent: 'center'}}>
                            <Text style = {{fontSize: 12, color: '#bfc1d1', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}>{this.state.user_email}</Text>
                        </View>
                        <View style = {{width: '100%', height:'30%', alignItems: 'center', justifyContent: 'center'}}>
                            <Text style = {{fontSize: 12, color: '#bfc1d1', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}>{this.state.user_phonenumber}</Text>
                        </View>
                    </View>
                    {/* <KeyboardAvoidingView behavior="padding" style={{width:'100%', height: '100%'}} enabled keyboardVerticalOffset={100}> */}
                    <View style = {styles.profile_container}>
                        <ScrollView showsVerticalScrollIndicator = {false} style = {{width: '100%', height: '100%'}}>
                            <View style = {styles.top_container}>
                                <TouchableOpacity style = {styles.component_view} onPress = {() => this.showLanguages()}>
                                    <View style = {styles.component_icon_view}>
                                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/language.png')}/>
                                    </View>
                                    <View style = {styles.component_languag_text_view}>
                                        <Text style = {styles.component_text}> {this.state.selected_language === 0 ? 'Ändra språk' : 'Change Language'} </Text>
                                    </View>
                                    <View style = {styles.component_icon_view}>
                                    {
                                        (this.state.selected_language == 0) &&
                                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/sweden_flag.png')}/>
                                    }
                                    {
                                        (this.state.selected_language == 1) &&
                                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/british_flag.png')}/>
                                    }
                                    </View>
                                    <View style = {styles.component_arrow_view}>
                                    {
                                        this.state.select_language_flag &&
                                        <Image style = {styles.component_down_arrow_image} resizeMode = {'contain'} source = {require('../assets/images/white_down_arrow.png')}/>
                                    }
                                    {
                                        !this.state.select_language_flag &&
                                        <Image style = {styles.component_right_arrow_image} resizeMode = {'contain'} source = {require('../assets/images/white_right_arrow.png')}/>
                                    }
                                    </View>
                                </TouchableOpacity>
                                {
                                    this.state.select_language_flag &&
                                    <View style = {{width: '100%', height: 35, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center'}}>
                                        <RadioForm
                                            radio_props={language_radio_props[this.state.selected_language]}
                                            initial={this.state.selected_language}
                                            buttonSize={12}
                                            buttonOuterSize={22}
                                            formHorizontal={true}
                                            labelStyle = {{fontSize: 13, color: '#bfc1d1', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}
                                            style = {{width: '70%', justifyContent: 'center', alignItems: 'flex-end'}}
                                            onPress={(value) => {(this.selectLanguage(value))}}
                                        >
                                        </RadioForm>
                                    </View>
                                }
                                <TouchableOpacity style = {styles.component_view} onPress = {() => this.showPasswordView()}>
                                    <View style = {styles.component_icon_view}>
                                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/password_white.png')}/>
                                    </View>
                                    <View style = {styles.component_text_view}>
                                        <Text style = {styles.component_text}> {this.state.selected_language === 0 ? 'Ändra lösenord' : 'Change Password'} </Text>
                                    </View>
                                    <View style = {styles.component_arrow_view}>
                                    {
                                        this.state.select_password_flag &&
                                        <Image style = {styles.component_down_arrow_image} resizeMode = {'contain'} source = {require('../assets/images/white_down_arrow.png')}/>
                                    }
                                    {
                                        !this.state.select_password_flag &&
                                        <Image style = {styles.component_right_arrow_image} resizeMode = {'contain'} source = {require('../assets/images/white_right_arrow.png')}/>
                                    }
                                    </View>
                                </TouchableOpacity>
                                {
                                    this.state.select_password_flag &&
                                    <View style = {{width: '100%', height: 160, alignItems: 'flex-end', justifyContent: 'center'}}>
                                        <View style = {{width: '90%', height: '25%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row'}}>
                                            <View style = {{width: '25%', height: '100%', justifyContent: 'center'}}>
                                                <Text style = {{fontSize: 13, color: '#bfc1d1', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}> {this.state.selected_language === 0 ? 'Gammalt' : 'Old'} </Text>
                                            </View>
                                            <View style = {{width: '70%', height: '100%', borderBottomColor: '#8219ed', borderBottomWidth: 1, justifyContent: 'center'}}>
                                                <TextInput underlineColorAndroid = 'transparent' secureTextEntry={true} style = {{width: '100%', height: '100%', fontSize: 13, color: '#bfc1d1', fontFamily: 'coreSansBold'}} onChangeText = {this.handleOldPassword}/>
                                            </View>
                                        </View>
                                        <View style = {{width: '90%', height: '25%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row'}}>
                                            <View style = {{width: '25%', height: '100%', justifyContent: 'center'}}>
                                                <Text style = {{fontSize: 13, color: '#bfc1d1', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}> {this.state.selected_language === 0 ? 'Nytt' : 'New'} </Text>
                                            </View>
                                            <View style = {{width: '70%', height: '100%', borderBottomColor: '#8219ed', borderBottomWidth: 1, justifyContent: 'center'}}>
                                                <TextInput underlineColorAndroid = 'transparent' secureTextEntry={true} style = {{width: '100%', height: '100%', fontSize: 13, color: '#bfc1d1', fontFamily: 'coreSansBold'}} onChangeText = {this.handleNewPassword}/>
                                            </View>
                                        </View>
                                        <View style = {{width: '90%', height: '25%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row'}}>
                                            <View style = {{width: '25%', height: '100%', justifyContent: 'center'}}>
                                                <Text style = {{fontSize: 13, color: '#bfc1d1', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}> {this.state.selected_language === 0 ? 'Upprepa' : 'Confirm'} </Text>
                                            </View>
                                            <View style = {{width: '70%', height: '100%', borderBottomColor: '#8219ed', borderBottomWidth: 1, justifyContent: 'center'}}>
                                                <TextInput underlineColorAndroid = 'transparent' secureTextEntry={true} style = {{width: '100%', height: '100%', fontSize: 13, color: '#bfc1d1', fontFamily: 'coreSansBold'}} onChangeText = {this.handleConfirmPassword}/>
                                            </View>
                                        </View>
                                        <View style = {{width: '90%', height: '25%', alignItems: 'center', justifyContent: 'center'}}>
                                            <TouchableOpacity style = {{width: '50%', height: '75%', borderRadius: 5, backgroundColor: '#ff4858', alignItems: 'center', justifyContent: 'center', marginRight: 30}} onPress = {() => this.changePassword()}>
                                                <Text style = {{fontSize: 15, color: '#ffffff', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}> {this.state.selected_language === 0 ? 'Ändra' : 'Change'} </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                }
                                <TouchableOpacity style = {styles.component_view} onPress = {() => this.showGroupIDs()}>
                                    <View style = {styles.component_icon_view}>
                                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/group_id_white.png')}/>
                                    </View>
                                    <View style = {styles.component_text_view}>
                                        <Text style = {styles.component_text}> {this.state.selected_language === 0 ? 'Grupp-ID:n' : 'Group IDs'} </Text>
                                    </View>
                                    <View style = {styles.component_arrow_view}>
                                    {
                                        this.state.select_groupid_flag &&
                                        <Image style = {styles.component_down_arrow_image} resizeMode = {'contain'} source = {require('../assets/images/white_down_arrow.png')}/>
                                    }
                                    {
                                        !this.state.select_groupid_flag &&
                                        <Image style = {styles.component_right_arrow_image} resizeMode = {'contain'} source = {require('../assets/images/white_right_arrow.png')}/>
                                    }
                                    </View>
                                </TouchableOpacity>
                                {
                                    this.state.select_groupid_flag &&
                                    <View style = {{width: '100%', alignItems: 'flex-end', justifyContent: 'center'}}>
                                        <View style = {{width: '90%', height: 40, alignItems: 'center', justifyContent: 'center', flexDirection: 'row'}}>
                                            <View style = {{width: '35%', height: '100%', justifyContent: 'center'}}>
                                                <Text style = {{fontSize: 13, color: '#bfc1d1', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}> {this.state.selected_language === 0 ? 'Huvudgrupp' : 'Main Group'} </Text>
                                            </View>
                                            <View style = {{width: '60%', height: '100%', justifyContent: 'center'}}>
                                                <Text style = {{fontSize: 13, color: '#bfc1d1', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}> {this.state.main_groupid} </Text>
                                            </View>
                                        </View>
                                        {
                                            (this.state.other_groupids.length > 0) &&
                                            <View style = {{width: '90%', justifyContent: 'center', flexDirection: 'row'}}>
                                                <View style = {{width: '35%', height: 40, justifyContent: 'center'}}>
                                                    <Text style = {{fontSize: 13, color: '#bfc1d1', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}> {this.state.selected_language === 0 ? 'Följer grupp' : 'Follow Group'} </Text>
                                                </View>
                                                <View style = {{width: '60%', justifyContent: 'center'}}>
                                                {
                                                    this.state.other_groupids.map((item, index) => 
                                                    <View key = {index} style = {{width: '100%', height: 40, justifyContent: 'center', flexDirection: 'row'}}>
                                                        <View style = {{width: '70%', height: '100%', justifyContent: 'center'}}>
                                                            <Text style = {{fontSize: 13, color: '#bfc1d1', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}> {item} </Text>
                                                        </View>
                                                        <View style = {{width: '30%', height: '100%', justifyContent: 'center', alignItems: 'flex-end'}}>
                                                            <TouchableOpacity style = {{width: 20, height: 20}} onPress = {() => this.deattachGroupID(index)}>
                                                                <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/cancel.png')}/>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                    )
                                                }
                                                </View>
                                            </View>
                                        }
                                        <View style = {{width: '90%', height: 40, alignItems: 'center', justifyContent: 'center', flexDirection: 'row'}}>
                                            <View style = {{width: '35%', height: '100%', justifyContent: 'center'}}>
                                                <Text style = {{fontSize: 13, color: '#bfc1d1', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}> {this.state.selected_language === 0 ? 'Ny grupp' : 'New Group'} </Text>
                                            </View>
                                            <View style = {{width: '60%', height: '100%', borderBottomColor: '#8219ed', borderBottomWidth: 1, justifyContent: 'center'}}>
                                                <TextInput underlineColorAndroid = 'transparent' style = {{width: '100%', height: '100%', fontSize: 13, color: '#bfc1d1', fontFamily: 'coreSansBold'}} onChangeText = {this.handleNewGroupID} keyboardType={Platform.OS === 'android' ? 'email-address' : 'ascii-capable'}>{this.state.newGroupID}</TextInput>
                                            </View>
                                        </View>
                                        <View style = {{width: '90%', height: 40, alignItems: 'center', justifyContent: 'center'}}>
                                            <TouchableOpacity style = {{width: '50%', height: '75%', borderRadius: 5, backgroundColor: '#ff4858', alignItems: 'center', justifyContent: 'center', marginRight: 30}} onPress = {() => this.attachNewGroupID()}>
                                                <Text style = {{fontSize: 15, color: '#ffffff', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}> {this.state.selected_language === 0 ? 'Börja följa' : 'Start to follow'} </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                }
                                <TouchableOpacity style = {styles.component_view} onPress = {() => this.showNotificationSound()}>
                                    <View style = {styles.component_icon_view}>
                                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/notification_alarm_white.png')}/>
                                    </View>
                                    <View style = {styles.component_text_view}>
                                        <Text style = {styles.component_text}> {this.state.selected_language === 0 ? 'Meddelande ljud' : 'Notification Sound'} </Text>
                                    </View>
                                    <View style = {styles.component_arrow_view}>
                                    {
                                        this.state.select_notificationaction_flag &&
                                        <Image style = {styles.component_down_arrow_image} resizeMode = {'contain'} source = {require('../assets/images/white_down_arrow.png')}/>
                                    }
                                    {
                                        !this.state.select_notificationaction_flag &&
                                        <Image style = {styles.component_right_arrow_image} resizeMode = {'contain'} source = {require('../assets/images/white_right_arrow.png')}/>
                                    }
                                    </View>
                                </TouchableOpacity>
                                {
                                    this.state.select_notificationaction_flag &&
                                    <View style = {{width: '90%', marginLeft: '10%'}}>
                                    {
                                        custom_sound[this.state.selected_language].map((item, index) => 
                                            <View key = {index} style = {{width: '100%', height: 35, flexDirection: 'row'}}>
                                                <View style = {{width: '80%', height: '100%', alignItems: 'flex-start', justifyContent: 'center'}}>
                                                    <Text style = {{fontSize: 13, fontFamily: 'coreSansBold', color: '#bfc1d1', paddingTop: Platform.OS === 'android' ? 0 : 6}}>{item}</Text>
                                                </View>
                                                <TouchableOpacity style = {{width: '20%', height: '100%', alignItems: 'center', justifyContent: 'center'}} onPress = {() => this.selectCustomSound(index)}>
                                                {
                                                    (this.state.selected_customsound === index) &&
                                                    <Image style = {{width: 20, height: 20}} resizeMode = 'contain' source = {require('../assets/images/checkbox.png')}/>
                                                }
                                                {
                                                    (this.state.selected_customsound !== index) &&
                                                    <Image style = {{width: 20, height: 20}} resizeMode = 'contain' source = {require('../assets/images/uncheckbox.png')}/>
                                                }
                                                </TouchableOpacity>
                                            </View>
                                        )
                                    }
                                        <TouchableOpacity style = {{width: '100%', height: 35, flexDirection: 'row'}} disabled = {Platform.OS === 'ios' ? this.state.disable_vibrationClickable : false} onPress = {() => {this.setState({select_vibration_flag: !this.state.select_vibration_flag})}}>
                                            <View style = {{width: '80%', height: '100%', alignItems: 'flex-start', justifyContent: 'center'}}>
                                                <Text style = {{fontSize: 13, color: this.state.disable_vibrationClickable ? '#808080' : '#bfc1d1', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}>{this.state.selected_language === 0 ? 'Vibrering' : 'Vibration'}</Text>
                                            </View>
                                            <View style = {{width: '20%', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                                                {
                                                    (this.state.vibration_option === 1) &&
                                                    <Text style = {{fontSize: 13, color: this.state.disable_vibrationClickable ? '#808080' : '#bfc1d1', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}> {this.state.selected_language === 0 ? 'På' : 'On'} </Text>
                                                }
                                                {
                                                    (this.state.vibration_option === 0) &&
                                                    <Text style = {{fontSize: 13, color: this.state.disable_vibrationClickable ? '#808080' : '#bfc1d1', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}> {this.state.selected_language === 0 ? 'Av' : 'Off'} </Text>
                                                }
                                            </View>
                                        </TouchableOpacity>
                                        {
                                            this.state.select_vibration_flag && !this.state.disable_vibrationClickable &&
                                            <View style = {{width: '100%', height: 35, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                <RadioForm
                                                    radio_props={vibration_radio_props[this.state.selected_language]}
                                                    initial={this.state.vibration_option}
                                                    buttonSize={12}
                                                    buttonOuterSize={22}
                                                    formHorizontal={true}
                                                    labelStyle = {{fontSize: 13, color: '#bfc1d1', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}
                                                    style = {{width: '80%', justifyContent: 'center', alignItems: 'center'}}
                                                    onPress={(value) => {(this.selectVibrationType(value))}}
                                                >
                                                </RadioForm>
                                            </View>
                                        }
                                    </View>
                                }
                                <TouchableOpacity style = {styles.component_view} onPress = {() => this.showPrivacy_Policy()}>
                                    <View style = {styles.component_icon_view}>
                                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/policy.png')}/>
                                    </View>
                                    <View style = {styles.component_text_view}>
                                        <Text style = {styles.component_text}> {this.state.selected_language === 0 ? 'Integritetspolicy' : 'Privacy Policy'} </Text>
                                    </View>
                                    <View style = {styles.component_arrow_view}>
                                    {
                                        this.state.select_policy_flag &&
                                        <Image style = {styles.component_down_arrow_image} resizeMode = {'contain'} source = {require('../assets/images/white_down_arrow.png')}/>
                                    }
                                    {
                                        !this.state.select_policy_flag &&
                                        <Image style = {styles.component_right_arrow_image} resizeMode = {'contain'} source = {require('../assets/images/white_right_arrow.png')}/>
                                    }
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style = {styles.component_view} onPress = {() => this.showHelp_Support()}>
                                    <View style = {styles.component_icon_view}>
                                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/help_support.png')}/>
                                    </View>
                                    <View style = {styles.component_text_view}>
                                        <Text style = {styles.component_text}> {this.state.selected_language === 0 ? 'Hjälp och support' : 'Help and Support'} </Text>
                                    </View>
                                    <View style = {styles.component_arrow_view}>
                                    {
                                        this.state.select_help_flag &&
                                        <Image style = {styles.component_down_arrow_image} resizeMode = {'contain'} source = {require('../assets/images/white_down_arrow.png')}/>
                                    }
                                    {
                                        !this.state.select_help_flag &&
                                        <Image style = {styles.component_right_arrow_image} resizeMode = {'contain'} source = {require('../assets/images/white_right_arrow.png')}/>
                                    }
                                    </View>
                                </TouchableOpacity>
                                {
                                    this.state.select_help_flag && (this.state.selected_language === 0) &&
                                    <Text style = {[styles.component_text, {width: '90%', marginLeft: 15}]}>Skicka dina frågor till support@safety-zone.se Vanligtvis har du svar inom 24-timmar. Eller besök oss på www.safety-zone.se</Text>
                                }
                                {
                                    this.state.select_help_flag && (this.state.selected_language === 1) &&
                                    <Text style = {[styles.component_text, {width: '90%', marginLeft: 15}]}>Please send your questions to support@safety-zone.se. Answer will be replied within 24 hours. Or you can visit www.safety-zone.se.</Text>
                                }
                            </View>
                            <View style = {styles.bottom_container}>
                                <TouchableOpacity style = {styles.component_view} onPress = {() => this.showAlert('delete')}>
                                    <View style = {styles.component_icon_view}>
                                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/delete_account.png')}/>
                                    </View>
                                    <View style = {styles.component_text_view}>
                                        <Text style = {styles.component_text}> {this.state.selected_language === 0 ? 'Radera konto' : 'Delete Account'} </Text>
                                    </View>
                                    <View style = {styles.component_arrow_view}>
                                        <Image style = {styles.component_right_arrow_image} resizeMode = {'contain'} source = {require('../assets/images/white_right_arrow.png')}/>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style = {styles.component_view} onPress = {() => this.showAlert('logout')}>
                                    <View style = {styles.component_icon_view}>
                                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/signout.png')}/>
                                    </View>
                                    <View style = {styles.component_text_view}>
                                        <Text style = {styles.component_text}> {this.state.selected_language === 0 ? 'Logga ut' : 'Log Out'} </Text>
                                    </View>
                                    <View style = {styles.component_arrow_view}>
                                        <Image style = {styles.component_right_arrow_image} resizeMode = {'contain'} source = {require('../assets/images/white_right_arrow.png')}/>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    
                    </View>
                    {/* </KeyboardAvoidingView> */}
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
    picture_view: {
        position: 'absolute',
        width: 100,
        height: 100,
        left: deviceWidth / 2 - 50,
        top: topSectionHeight - 50,
        backgroundColor: '#ffffff',
        borderRadius: 100,
        overflow: 'hidden'
    },
    title_text: {
        color: '#ffffff',
        fontSize: 20,
        marginTop: 40,
        fontFamily: 'coreSansBold', 
        paddingTop: Platform.OS === 'android' ? 0 : 10
    },
    camera_view: {
        width: 30,
        height: 30,
        borderRadius: 30,
        overflow: 'hidden',
        position: 'absolute',
        left: deviceWidth / 2 + 20,
        top: topSectionHeight + 25,
    },
    gallery_view: {
        width: 30,
        height: 30,
        borderRadius: 30,
        overflow: 'hidden',
        position: 'absolute',
        left: deviceWidth / 2 - 70,
        top: topSectionHeight - 20,
    },
    main_section: {
        width: '100%',
        height: mainSectionHeight - 20,
        // backgroundColor: '#555555',
        marginTop: 60,
        // marginLeft: 10,
        // marginRight: 10,
        marginBottom: 10,
        alignItems: 'center',
        // justifyContent: 'center',
        borderRadius: 10,
    },
    profile_container: {
        width: '95%', 
        height: deviceHight - (260 + bannerHeight),
        marginTop: 10, 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    top_container: {
        width: '100%', 
        borderRadius: 10, 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#0a0f2c'
    },
    component_view: {
        width: '90%', 
        height: 45, 
        borderBottomColor: '#8219ed', 
        borderBottomWidth: 1, 
        marginBottom: 5, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center',
    },
    component_icon_view: {
        width: '15%', 
        height: '50%', 
        justifyContent: 'center'
    },
    component_languag_text_view: {
        width: '60%', 
        height: '90%', 
        justifyContent: 'center'
    },
    component_text_view: {
        width: '75%', 
        height: '90%', 
        justifyContent: 'center'
    },
    component_text: {
        fontSize: 15, 
        color: '#bfc1d1',
        fontFamily: 'coreSansBold',
        paddingTop: Platform.OS === 'android' ? 0 : 7
    },
    component_arrow_view: {
        width: '10%', 
        height: '40%', 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    component_down_arrow_image: {
        width: '60%', 
        height: '100%'
    },
    component_right_arrow_image: {
        width: '100%', 
        height: '100%'
    },
    modal: {
        // width: '95%',
        // height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContainer: {
        // width: deviceWidth * 0.9,
        // height: deviceHight * 0.9,
        width: '95%',
        height: '95%',
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,

    },
    modal_header: {
        width: '100%',
        height: '10%',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        overflow: 'hidden'
    },
    modal_body: {
        width: '100%',
        height: '90%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottom_container: {
        width: '100%', 
        borderRadius: 10, 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#0a0f2c',
        marginTop: 10,
    },
    banner_section: {
        position: 'absolute',
        width: '100%',
        height: bannerHeight,
        bottom: 0,
        backgroundColor: '#392b59',
    },

    
});