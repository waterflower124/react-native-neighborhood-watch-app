
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
    Keyboard
 } from 'react-native';

import {Font, Constants, SQLite} from 'expo';
import { ImagePicker, Permissions, ImageManipulator } from 'expo';

import {
    CoreSnasCRLight,
    CoreSnasCRRegular,
    CoreSnasCRBold,
} from '../Global/Global'

import Global from '../Global/Global';
import ExpandableList from '../components/ExpandableList/ExpandableList';
import { BallIndicator } from 'react-native-indicators';

const db = SQLite.openDatabase('dBase.db');

var deviceWidth = Dimensions.get('window').width;
var deviceHight = Dimensions.get('window').height;
var bannerHeight = deviceHight * 0.1;
var topSectionHeight = 120;
// var mainSectionHeight = deviceHight - (topSectionHeight + bannerHeight + 50);
var mainSectionHeight = deviceHight - (topSectionHeight + 50);

export default class CreateProfile extends Component {
	static navigationOptions = {
		header: null,
	};

	constructor(props) {
        super(props);
        
        this.state = {
            isReady: false,

            mainScrollViewEnabled: true,

            groupID: '',
            email: '',
            password: '',
            firstName: '',
            familyName: '',
            streetAddress: '',
            streetNumber: '',
            postalCode: '',
            mobileNumber: '',
            city: '',
            selectedCountry: Global.countries[0],

            myPicture_uri: '',

            expandCountries: false,

            showIndicator: false,

            selected_language: 1,////if 0 then Sweden, if 1 then English

            sigupButtonViewFlag: false,

            keyboardHeight: 0,
            tapped_textinputindex: 0,
        };
    };

    initLanguage() {
        Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT);
        this.setState({selected_language: Global.language});
    }
    componentDidMount() {
        // this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        // this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));

        this.props.navigation.addListener('willFocus', this.initLanguage.bind(this));
    };

    // _keyboardDidShow(e) {
    //     this.setState({
    //         keyboardHeight: e.endCoordinates.height
    //     }, () => this.mainScrollView.scrollTo({y: 60 * this.state.tapped_textinputindex, animated: true}));
    //     console.log(e.endCoordinates.height);
    // }
    
    // _keyboardDidHide(e) { 
    //      this.setState({keyboardHeight: 0});
    // }

    // componentWillUnmount() {
    //     this.keyboardDidShowListener.remove();
    //     this.keyboardDidHideListener.remove();
    // }

    async componentWillMount() {
        await Expo.Font.loadAsync({
            coreSansLight: CoreSnasCRLight,
            coreSansRegular: CoreSnasCRRegular,
            coreSansBold: CoreSnasCRBold,
        });
        this.setState({isReady: true});

        this.getCameeraPermission();

		// BackHandler.addEventListener('hardwareBackPress', () => {return true});
		// Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT);
        // StatusBar.setHidden(true);

        // alert(deviceHight + " " + mainSectionHeight + " " + topSectionHeight + " " + bannerHeight);
        
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

    takePhotoFromGallery = async() => {
        
        let result = await Expo.ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            width: '100%',
            height: '100%',
            aspect: [1, 1],
        });
      
        // if (!result.cancelled) {
        //     this.setState({ myPicture_uri: result.uri });
        // }

        if (!result.cancelled) {

            this.setState({showIndicator: true});
            var resizedPhoto;
            if((result.width < result.height) && (result.width > 500)) {
                resizedPhoto = await ImageManipulator.manipulate(result.uri, [{ resize: { width: 500 }}], { format: 'jpeg', compress: 0.5});
            } else if((result.width >= result.height) && (result.height > 500)) {
                resizedPhoto = await ImageManipulator.manipulate(result.uri, [{ resize: { height: 500 }}], { format: 'jpeg', compress: 0.5});
            } else {
                resizedPhoto = result;
            }

            self = this;
            setTimeout(function(){
                self.setState({showIndicator: false});
                self.setState({ myPicture_uri: resizedPhoto.uri });
            }, 5000);
        }

    };

    takePhotoFromCamera = async() => {
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            width: '100%',
            height: '100%',
            aspect: [1, 1],
        });
      
        // if (!result.cancelled) {
        //     this.setState({ myPicture_uri: result.uri});
        // }

        if (!result.cancelled) {

            this.setState({showIndicator: true});
            var resizedPhoto;
            if((result.width < result.height) && (result.width > 500)) {
                resizedPhoto = await ImageManipulator.manipulate(result.uri, [{ resize: { width: 500 }}], { format: 'jpeg', compress: 0.5});
            } else if((result.width >= result.height) && (result.height > 500)) {
                resizedPhoto = await ImageManipulator.manipulate(result.uri, [{ resize: { height: 500 }}], { format: 'jpeg', compress: 0.5});
            } else {
                resizedPhoto = result;
            }

            self = this;
            setTimeout(function(){
                self.setState({showIndicator: false});
                self.setState({ myPicture_uri: resizedPhoto.uri });
            }, 5000);
        }
    };

    itemPicker_countryList = (item, index) => {
        this.setState({
            selectedCountry: item,
            expandCountries: false,
            mainScrollViewEnabled: true,
        });
    };

    expandList_countryList = () => {
        this.setState({expandCountries: !this.state.expandCountries});
    };

    mainScrollEnabled = (index) => {
        this.mainScrollView.scrollTo({y: 60 * index});
        // this.setState({tapped_textinputindex: index});
        this.setState({
            mainScrollViewEnabled: true,
            expandCountries: false
        })
    };

    backToSignIn = () => {
        this.props.navigation.navigate('SignIn');
    };

    handleGroup_id = (typedText) => {
        this.setState({groupID: typedText});
        
    };

    handleEmail = (typedText) => {
        this.setState({email: typedText});
    };

    handlePassword = (typedText) => {
        this.setState({password: typedText});
    };

    handleMobileNumber = (typedText) => {
        this.setState({mobileNumber: typedText});
    };

    handleFirstName = (typedText) => {
        this.setState({firstName: typedText});
    };

    handleFamilyName = (typedText) => {
        this.setState({familyName: typedText});
    };

    handleStreetAddress = (typedText) => {
        this.setState({streetAddress: typedText});
    };

    handlePostalCode = (typedText) => {
        this.setState({postalCode: typedText});
    };

    handleCity = (typedText) => {
        this.setState({city: typedText});
    };

    signUp = () => {

        if(this.state.groupID === '') {
            if(this.state.selected_language === 1) {
                Alert.alert('Please notice!', 'Please fill in Group-ID.');
            } else if(this.state.selected_language === 0) {
                Alert.alert('Observera!', 'Fyll i grupp-ID.');
            }
            return;
        };
        if(this.state.email === '') {
            if(this.state.selected_language === 1) {
                Alert.alert('Please notice!', 'Please fill in Username(Email).');
            } else if(this.state.selected_language === 0) {
                Alert.alert('Observera!', 'Fyll i användarnamn (email).');
            }
            return;
        };
        let regExpression = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
        if(regExpression.test(this.state.email) === false) {
            if(self.state.selected_language === 1) {
                Alert.alert("Please notice!", 'The email must be a valid email address.');
            } else if(self.state.selected_language === 0) {
                Alert.alert("Observera!", 'E-postmeddelandet måste vara en giltig e-postadress.');
            }
            return;
        };
        if(this.state.password === '') {
            if(this.state.selected_language === 1) {
                Alert.alert('Please notice!', 'Please fill in Password.');
            } else if(this.state.selected_language === 0) {
                Alert.alert('Observera!', 'Fyll i lösenord.');
            }
            return;
        };
        if(this.state.password.length < 6 ) {
            if(this.state.selected_language === 1) {
                Alert.alert('Please notice!', 'The Password must be at least 6 characters.');
            } else if(this.state.selected_language === 0) {
                Alert.alert('Observera!', 'Lösenordet måste vara minst 6 tecken.');
            }
            return;
        };
        if(this.state.mobileNumber === '') {
            if(this.state.selected_language === 1) {
                Alert.alert('Please notice!', 'Please fill in Mobile Number.');
            } else if(this.state.selected_language === 0) {
                Alert.alert('Observera!', 'Fyll i mobilenummer.');
            }
            return;
        };
        if(this.state.firstName === '') {
            if(this.state.selected_language === 1) {
                Alert.alert('Please notice!', 'Please fill in First Name.');
            } else if(this.state.selected_language === 0) {
                Alert.alert('Observera!', 'Fyll i förnamn.');
            }
            return;
        };
        if(this.state.familyName === '') {
            if(this.state.selected_language === 1) {
                Alert.alert('Please notice!', 'Please fill in Street Address & Number.');
            } else if(this.state.selected_language === 0) {
                Alert.alert('Observera!', 'Fyll i efternamn.');
            }
            return;
        };
        if(this.state.streetAddress === '') {
            if(this.state.selected_language === 1) {
                Alert.alert('Please notice!', 'Please fill in Family Name.');
            } else if(this.state.selected_language === 0) {
                Alert.alert('Observera!', 'Fyll i gatuadress och nummer.');
            }
            return;
        };

        if(this.state.postalCode === '') {
            if(this.state.selected_language === 1) {
                Alert.alert('Please notice!', 'Please fill in Postal code.');
            } else if(this.state.selected_language === 0) {
                Alert.alert('Observera!', 'Fyll i postnummer.');
            }
            return;
        };
        if(this.state.city === '') {
            if(this.state.selected_language === 1) {
                Alert.alert('Please notice!', 'Please fill in City.');
            } else if(this.state.selected_language === 0) {
                Alert.alert('Observera!', 'Fyll i stad.');
            }
            return;
        };
        
        var formData = new FormData();
        if(this.state.myPicture_uri !== '') {
            let localUri = this.state.myPicture_uri;
            let localUriNamePart = localUri.split('/');
            const fileName = localUriNamePart[localUriNamePart.length - 1];
            let localUriTypePart = localUri.split('.');
            const fileType = localUriTypePart[localUriTypePart.length - 1];

            formData.append('avatar', {
                uri: this.state.myPicture_uri,
                name: fileName,
                type: `image/${fileType}`,
            })

        } 

        formData.append('group_id', this.state.groupID);
        formData.append('email', this.state.email);
        formData.append('password', this.state.password);
        formData.append('first_name', this.state.firstName);
        formData.append('family_name', this.state.familyName);
        formData.append('country', this.state.selectedCountry);
        formData.append('street_address', this.state.streetAddress);
        // formData.append('street_number', this.state.streetNumber);
        formData.append('postal_code', this.state.postalCode);
        formData.append('phone_number', this.state.mobileNumber);
        formData.append('city', this.state.city);
        
        this.setState({showIndicator: true});
        self = this;
        fetch('https://safetyzonemessage.com/api/auth/signup', {
                method: 'POST',
                headers: {
                    // 'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
        
                },
                body: formData
                
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                self.setState({showIndicator: false});
                if(data.status === 'fail') {
                    if(data.error_type === 'email_exist') {
                        if(self.state.selected_language === 1) {
                            Alert.alert("Please notice!", 'Your email already signed up.');
                        } else if(self.state.selected_language === 0) {
                            Alert.alert("Observera!", 'Det finns redan ett konto med den här E-Post adressen.');
                        }
                    } else if(data.error_type === 'match_group') {
                        if(self.state.selected_language === 1) {
                            Alert.alert("Please notice!", 'Your Group ID does not exist.');
                        } else if(self.state.selected_language === 0) {
                            Alert.alert("Observera!", 'Grupp-ID du angett är felaktigt.');
                        }
                    }
                    // else if(data.error_type === 'no_fill') {
                    //     if(self.state.selected_language === 1) {
                    //         Alert.alert("Please notice!", 'The email must be a valid email address.');
                    //     } else if(self.state.selected_language === 0) {
                    //         Alert.alert("Observera!", 'E-postmeddelandet måste vara en giltig e-postadress.');
                    //     }
                    // }
                } else if(data.status === 'success'){

                    var email_db = self.state.email;
                    var password_db = self.state.password;
                    //   console.log(self.state.email + '  ' + self.state.password);
                    db.transaction(
                        tx => {
                            tx.executeSql('delete from items where 1');
                        
                        },
                        null,
                    );
                    db.transaction(
                        tx => {
                            // tx.executeSql('insert into items (email, password) values (?, ?)', [email_db, password_db]);
                            tx.executeSql('insert into items (email, password, login) values (?, ?, 1)', [email_db, password_db]);
                        },
                        null,
                    );
                   
                    if(self.state.selected_language === 1) {
                        Alert.alert("Notice", 'Your personal profile is now created.',
                            [
                                // {text: 'Cancel', onPress: () => self.gotoHome('cancel')},
                                {text: 'OK', onPress: () => self.gotoHome('ok')}
                            ],
                            { cancelable: true }
                        );
                    } else if(self.state.selected_language === 0) {
                        Alert.alert("Grattis", 'Din personliga profil är nu skapad!',
                            [
                                // {text: 'Avbryt', onPress: () => self.gotoHome('cancel')},
                                {text: 'OK', onPress: () => self.gotoHome('ok')}
                            ],
                            { cancelable: true }
                        );
                    }
                }
                
            })
            .catch(function(error) {
                // console.log("Network error");
                self.setState({showIndicator: false});
                if(self.state.selected_language === 1) {
                    Alert.alert('Please notice!', 'Network error.');
                } else if(self.state.selected_language === 0) {
                    Alert.alert('Observera!', 'Nätverksproblem.');
                }
            })
        // this.props.navigation.navigate('SignIn');
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
            console.log("camera roll failure");
        }

        const permissionCamera = await Permissions.getAsync(Permissions.CAMERA);
        if (permissionCamera.status !== 'granted') {
            const newPermission = await Permissions.askAsync(Permissions.CAMERA);
            if (newPermission.status === 'granted') {
                //its granted.
                console.log("camera granted");
            }
        } else {
            console.log("camera failure");
        }
    }

    gotoHome = async(type) => {
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
                self.setState({showIndicator: false});
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
                    
                    // if(type === 'ok') {
                    //     var email_db = email_trim;
                    //     var password_db = self.state.password;
                    //     //   console.log(self.state.email + '  ' + self.state.password);
                    //     db.transaction(
                    //         tx => {
                    //             tx.executeSql('delete from items where 1');
                            
                    //         },
                    //         null,
                    //     );
                    //     db.transaction(
                    //         tx => {
                    //             // tx.executeSql('insert into items (email, password) values (?, ?)', [email_db, password_db]);
                    //             tx.executeSql('insert into items (email, password, login) values (?, ?, 1)', [email_db, password_db]);
                    //         },
                    //         null,
                    //     );
                    // };
                    self.setState({
                        email: '',
                        password: '',
                    });

                    // /////  send push notification token to server
                    // self.sendPushNotificationToken();

                    ////get camera permission
                    self.getCameeraPermission();
                    
                    this.props.navigation.navigate('Home');
                }
                
            })
            .catch(function(error) {
                self.setState({showIndicator: false});
                Alert.alert('Please notice!', 'Network error.');
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
                <TouchableOpacity style = {styles.back_button_view} onPress = {() => this.backToSignIn()}>
                    <View style = {{width: 15, height: '100%'}}>
                        <Image style = {styles.icon} resizeMode = 'contain' source = {require('../assets/images/left_arrow.png')}/>
                    </View>
                    {/* <View style = {{width: '70%', height: '100%', justifyContent: 'center', marginLeft: 10}}>
                        <Text style = {{fontSize: 12, color: '#ffffff', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}>{this.state.selected_language === 0 ? 'Logga In' : 'Sign in'}</Text>
                    </View> */}
                </TouchableOpacity>
                <View style = {styles.top_section}>
                    {/* <ImageBackground style = {{width: '100%', height: '100%', alignItems: 'center'}} resizeMode = {'stretch'} source = {require('../assets/images/top_head.png')}> */}
                        <Text style = {styles.title_text}> {this.state.selected_language === 0 ? 'Skapa profil' : 'Create Profile'} </Text>
                    {/* </ImageBackground> */}
                </View>
                <View style = {styles.marker_view}>
                {
                    (this.state.myPicture_uri == '') &&
                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/empty_picture.png')}/>
                }
                {
                    (this.state.myPicture_uri != '') &&
                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {{uri: this.state.myPicture_uri}}/>
                }
                </View>
                <TouchableOpacity style = {styles.camera_view} onPress = {() => this.takePhotoFromCamera()}>
                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/myprofile_camera.png')}/>
                </TouchableOpacity>
                <TouchableOpacity style = {styles.gallery_view} onPress = {() => this.takePhotoFromGallery()}>
                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/createprofile_gallery.png')}/>
                </TouchableOpacity>
                
                <View style = {styles.main_section}>
                    <View style = {{width: '100%', height: '85%'}}>
                        <ScrollView showsVerticalScrollIndicator = {false} style = {{flex: 1, marginLeft: 10, marginRight: 10}}  scrollEnabled = {this.state.mainScrollViewEnabled}
                            keyboardShouldPersistTaps={'padding'}
                            ref={ref => this.mainScrollView = ref}
                            // onContentSizeChange={(contentWidth, contentHeight)=>{
                            //     if (Platform.OS === 'android') {        
                            //         this.state.expandCountries  ?  this.mainScrollView.scrollToEnd({animated: true}) : null;
                            //     }
                            // }}
                        >
                            <KeyboardAvoidingView style = {{flex: 1}}>
                                <View style = {styles.input_box}>
                                    <View style = {styles.input_box_title_view}>
                                        <View style = {styles.icon_view}>
                                            <Image style = {styles.icon} resizeMode = 'contain' source = {require('../assets/images/group_id.png')}/>
                                        </View>
                                        <View style = {styles.input_title_view}>
                                            <Text style = {styles.input_title_text}> {this.state.selected_language === 0 ? 'Grupp-ID' : 'Group-ID'} </Text>
                                        </View>
                                    </View>
                                    <View style = {styles.input_box_content_view}>
                                        <TextInput onTouchStart = {() => this.mainScrollEnabled(0)} underlineColorAndroid = 'transparent' placeholder = {this.state.selected_language === 0 ? 'Ange föreningens Grupp-ID.' : ''} style = {styles.input_box_content_text} onChangeText = {this.handleGroup_id} keyboardType={Platform.OS === 'android' ? 'email-address' : 'ascii-capable'}/>
                                    </View>
                                </View>
                                <View style = {styles.input_box}>
                                    <View style = {styles.input_box_title_view}>
                                        <View style = {styles.icon_view}>
                                            <Image style = {[styles.icon, {width: '50%'}]} resizeMode = 'contain' source = {require('../assets/images/email_black.png')}/>
                                        </View>
                                        <View style = {styles.input_title_view}>
                                            <Text style = {styles.input_title_text}> {this.state.selected_language === 0 ? 'Användarnamn(Email)' : 'Username(Email)'}</Text>
                                        </View>
                                    </View>
                                    <View style = {styles.input_box_content_view}>
                                        <TextInput onTouchStart = {() => this.mainScrollEnabled(1)} underlineColorAndroid = 'transparent' style = {styles.input_box_content_text} onChangeText = {this.handleEmail} keyboardType={Platform.OS === 'android' ? 'email-address' : 'ascii-capable'}/>
                                    </View>
                                </View>
                                <View style = {styles.input_box}>
                                    <View style = {styles.input_box_title_view}>
                                        <View style = {styles.icon_view}>
                                            <Image style = {styles.icon} resizeMode = 'contain' source = {require('../assets/images/password_black.png')}/>
                                        </View>
                                        <View style = {styles.input_title_view}>
                                            <Text style = {styles.input_title_text}> {this.state.selected_language === 0 ? 'Lösenord' : 'Password'} </Text>
                                        </View>
                                    </View>
                                    <View style = {styles.input_box_content_view}>
                                        <TextInput onTouchStart = {() => this.mainScrollEnabled(2)} underlineColorAndroid = 'transparent' secureTextEntry={true} style = {styles.input_box_content_text} onChangeText = {this.handlePassword}/>
                                    </View>
                                </View>
                                <View style = {styles.input_box}>
                                    <View style = {styles.input_box_title_view}>
                                        <View style = {styles.icon_view}>
                                            <Image style = {styles.icon} resizeMode = 'contain' source = {require('../assets/images/mobile_number.png')}/>
                                        </View>
                                        <View style = {styles.input_title_view}>
                                            <Text style = {styles.input_title_text}> {this.state.selected_language === 0 ? 'Mobilnummer' : 'Mobile Number'} </Text>
                                        </View>
                                    </View>
                                    <View style = {styles.input_box_content_view}>
                                        <TextInput onTouchStart = {() => this.mainScrollEnabled(3)} keyboardType = {'phone-pad'} underlineColorAndroid = 'transparent' style = {styles.input_box_content_text} onChangeText = {this.handleMobileNumber}/>
                                    </View>
                                </View>
                                <View style = {styles.input_box}>
                                    <View style = {styles.input_box_title_view}>
                                        <View style = {styles.icon_view}>
                                            <Image style = {styles.icon} resizeMode = 'contain' source = {require('../assets/images/name.png')}/>
                                        </View>
                                        <View style = {styles.input_title_view}>
                                            <Text style = {styles.input_title_text}> {this.state.selected_language === 0 ? 'Förnamn' : 'First Name'} </Text>
                                        </View>
                                    </View>
                                    <View style = {styles.input_box_content_view}>
                                        <TextInput onTouchStart = {() => this.mainScrollEnabled(4)} underlineColorAndroid = 'transparent' style = {styles.input_box_content_text} onChangeText = {this.handleFirstName} keyboardType={Platform.OS === 'android' ? 'email-address' : 'ascii-capable'}/>
                                    </View>
                                </View>
                                <View style = {styles.input_box}>
                                    <View style = {styles.input_box_title_view}>
                                        <View style = {styles.icon_view}>
                                            <Image style = {styles.icon} resizeMode = 'contain' source = {require('../assets/images/name.png')}/>
                                        </View>
                                        <View style = {styles.input_title_view}>
                                            <Text style = {styles.input_title_text}> {this.state.selected_language === 0 ? 'Efternamn' : 'Family Name'} </Text>
                                        </View>
                                    </View>
                                    <View style = {styles.input_box_content_view}>
                                        <TextInput onTouchStart = {() => this.mainScrollEnabled(5)} underlineColorAndroid = 'transparent' style = {styles.input_box_content_text} onChangeText = {this.handleFamilyName} keyboardType={Platform.OS === 'android' ? 'email-address' : 'ascii-capable'}/>
                                    </View>
                                </View>
                                
                                <View style = {styles.input_box}>
                                    <View style = {styles.input_box_title_view}>
                                        <View style = {styles.icon_view}>
                                            <Image style = {styles.icon} resizeMode = 'contain' source = {require('../assets/images/street_address.png')}/>
                                        </View>
                                        <View style = {styles.input_title_view}>
                                            <Text style = {styles.input_title_text}> {this.state.selected_language === 0 ? 'Gatuadress och nummer' : 'Street Address & Number'} </Text>
                                        </View>
                                    </View>
                                    <View style = {styles.input_box_content_view}>
                                        <TextInput onTouchStart = {() => this.mainScrollEnabled(6)} underlineColorAndroid = 'transparent' style = {styles.input_box_content_text} onChangeText = {this.handleStreetAddress} keyboardType={Platform.OS === 'android' ? 'email-address' : 'ascii-capable'}/>
                                    </View>
                                </View>
                                <View style = {styles.input_box}>
                                    <View style = {styles.input_box_title_view}>
                                        <View style = {styles.icon_view}>
                                            <Image style = {styles.icon} resizeMode = 'contain' source = {require('../assets/images/postal_code.png')}/>
                                        </View>
                                        <View style = {styles.input_title_view}>
                                            <Text style = {styles.input_title_text}> {this.state.selected_language === 0 ? 'Postnummer' : 'Postal code'} </Text>
                                        </View>
                                    </View>
                                    <View style = {styles.input_box_content_view}>
                                        <TextInput onTouchStart = {() => this.mainScrollEnabled(7)} keyboardType = {'numeric'} underlineColorAndroid = 'transparent' style = {styles.input_box_content_text} onChangeText = {this.handlePostalCode} keyboardType={Platform.OS === 'android' ? 'email-address' : 'ascii-capable'}/>
                                    </View>
                                </View>
                                <View style = {styles.input_box}>
                                    <View style = {styles.input_box_title_view}>
                                        <View style = {styles.icon_view}>
                                            <Image style = {styles.icon} resizeMode = 'contain' source = {require('../assets/images/city_hall.png')}/>
                                        </View>
                                        <View style = {styles.input_title_view}>
                                            <Text style = {styles.input_title_text}> {this.state.selected_language === 0 ? 'Stad' : 'City'} </Text>
                                        </View>
                                    </View>
                                    <View style = {styles.input_box_content_view}>
                                        <TextInput onTouchStart = {() => this.mainScrollEnabled(8)} underlineColorAndroid = 'transparent' style = {styles.input_box_content_text} onChangeText = {this.handleCity} keyboardType={Platform.OS === 'android' ? 'email-address' : 'ascii-capable'}/>
                                    </View>
                                </View>
                                <View style = {[styles.input_box, this.state.expandCountries ? {zIndex: 50, height: 150}: {zIndex: 50, }]}>
                                    <View style = {styles.input_box_title_view}>
                                        <View style = {styles.icon_view}>
                                            <Image style = {styles.icon} resizeMode = 'contain' source = {require('../assets/images/countries.png')}/>
                                        </View>
                                        <View style = {styles.input_title_view}>
                                            <Text style = {styles.input_title_text}> {this.state.selected_language === 0 ? 'Land' : 'Country'} </Text>
                                        </View>
                                    </View>
                                    <View style = {[{width: '100%',borderBottomColor: '#6e1ced',borderBottomWidth: 1,}, this.state.expandCountries ? {height: 120, marginTop: 10} : {height: 40,justifyContent: 'center'}]}>
                                        <View style={[Platform.OS === 'android' ? {width: '100%'} : {zIndex: 100, width: '100%'}]}>
                                            <ScrollView 
                                                ref={ref => this.scrollViewCountries = ref}
                                                onContentSizeChange={(contentWidth, contentHeight)=>{        
                                                    !this.state.expandCountries  ?  this.scrollViewCountries.scrollToEnd({animated: true}) : null;
                                                }}
                                                style = {this.state.expandCountries ? styles.list_expand : styles.list_close}
                                                onTouchStart = {(ev) => {this.setState({mainScrollViewEnabled: false});}}
                                                onMomentumScrollEnd = {(e) => {this.setState({mainScrollViewEnabled: true});}}
                                                onScrollEndDrag = {(e) => {this.setState({mainScrollViewEnabled: true});}}
                                            >
                                                <ExpandableList
                                                    data = {Global.countries}
                                                    itemPicker = {this.itemPicker_countryList}
                                                    expandList = {this.expandList_countryList}
                                                    expanded = {this.state.expandCountries}
                                                    selectedItem = {this.state.selectedCountry}
                                                    containerStyle={this.state.expandCountries ? { 
                                                        height: 'auto'
                                                    } : null}
                                                />
                                            </ScrollView>
                                        </View>
                                    </View>
                                </View>
                            </KeyboardAvoidingView>
                            <View style = {{width: '100%', height: 250}}></View>
                        </ScrollView>
                    </View>
                   
                    <View style = {styles.signout_button_view}>
                    {
                        // this.state.sigupButtonViewFlag &&
                        <TouchableOpacity style = {styles.signout_button} onPress = {() => this.signUp()}>
                            <Text style = {{color: '#ffffff', fontSize: 15, fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 7}}> {this.state.selected_language === 0 ? 'Registrera' : 'Sign up'} </Text>
                        </TouchableOpacity>
                    }
                    </View> 
                </View>
                {/* <View style = {styles.banner_section}>
                </View> */}
                
            </View>
        );
    }

}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#ffffff',
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
        overflow: 'hidden',
        borderRadius: 80,
        // backgroundColor: '#444444'

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
        top: topSectionHeight + 15,
    },
    gallery_view: {
        width: 30,
        height: 30,
        borderRadius: 30,
        overflow: 'hidden',
        position: 'absolute',
        left: deviceWidth / 2 - 60,
        top: topSectionHeight - 15,
    },
    main_section: {
        width: '100%',
        height: mainSectionHeight,
        // backgroundColor: '#555555',
        marginTop: 50,
    },
    input_box: {
        width: '100%',
        height: 60,
        marginBottom: 10,
    },
    input_box_title_view: {
        width: '100%',
        height: 20,
        flexDirection: 'row',
    },
    icon_view: {
        width: '10%',
        height: '100%',
        alignItems: 'center', 
        justifyContent: 'center'
    },
    icon: {
        width: '100%',
        height: '100%',
    },
    input_title_view: {
        width: '80%',
        height: '100%',
        justifyContent: 'center',

    },
    input_title_text: {
        fontSize: 15,
        color: '#0a0f2c',
        fontFamily: 'coreSansBold',
        paddingTop: Platform.OS === 'android' ? 0 : 7
    },
    input_box_content_view: {
        width: '100%',
        height: 40,
        borderBottomColor: '#6e1ced',
        borderBottomWidth: 1,
        justifyContent: 'center',
    },
    input_box_content_text: {
        fontSize: 15,
        marginLeft: 15,
        fontFamily: 'coreSansBold',
        paddingTop: Platform.OS === 'android' ? 0 : 7
    },
    list_expand: {
		// top:25,
		zIndex: 25,
		position:'absolute',
		width:'100%',
		height: 120,
		// backgroundColor: '#ffff00',
		// borderWidth:1,
		// borderColor:'#e9e3d5',
        // marginBottom: 24
        // bottom: 0,
	},
	list_close: {        
		// marginBottom: 24,
		zIndex: -1
	},
    signout_button_view: {
        width: '100%',
        height: '15%',
        alignItems: 'center',
        justifyContent: 'space-around',
        // marginTop: 100,
        flexDirection: 'row',
    },
    signout_button: {
        width: '60%',
        height: '70%',
        backgroundColor: '#ff4858',
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },

    banner_section: {
        position: 'absolute',
        width: '100%',
        height: bannerHeight,
        bottom: 0,
        backgroundColor: '#666665',
    },

    
});