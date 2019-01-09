
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
    Linking,
 } from 'react-native';

import {Font, Constants} from 'expo';
import { BallIndicator } from 'react-native-indicators';

import Global, {
    CoreSnasCRLight,
    CoreSnasCRRegular,
    CoreSnasCRBold,
} from '../Global/Global'

// import Global from '../Global';

var deviceWidth = Dimensions.get('window').width;
var deviceHight = Dimensions.get('window').height;
var bannerHeight = deviceHight * 0.1;
var topSectionHeight = 120;
var mainSectionHeight = deviceHight - (topSectionHeight + bannerHeight + 40);
var componentHeight = (deviceWidth - 30) / 2;

var first_time = true;

export default class ForgotPassword extends Component {
	static navigationOptions = {
		header: null,
	};

	constructor(props) {
        super(props);
        
        this.state = {
            isReady: false,
            verifyCode_view: false,
            newPassword_view: false,
            email: '',
            verificationCode: '',
            newPassword: '',
            confirmPassword: '',

            authoToken: '',

            showIndicator: false,

            emailSendButtonDisable: false,
            verificationCodeSendButtonDisable: false,

            selected_language: 1,////if 0 then Sweden, if 1 then English
            
        };
    };

    initLanguage() {
        Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT);
        this.setState({selected_language: Global.language});
        
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
        
    };

    goSignIn = () => {
        this.props.navigation.navigate('SignIn');
        // alert("5555555");
    };

    sendEmail = async () => {
        if(this.state.email === '') {
            if(this.state.selected_language === 1) {
                Alert.alert('Please notice!', 'The Email is required.');
            } else {
                Alert.alert('Observera!', 'Fyll i giltig Epost adress.');
            }
            return;
        }
        this.setState({showIndicator: true});
        self = this;
        await fetch('https://safetyzonemessage.com/api/auth/forget-password', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
        
                },
                body: JSON.stringify({
                    'email': self.state.email,
                })
            })
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                if(data.status === 'fail') {
                    if(self.state.selected_language === 1) {
                        Alert.alert("Please notice!", 'There is no user for this email.');
                    } else if(self.state.selected_language === 0) {
                        Alert.alert("Observera!", 'Det finns ingen användare med denna mailadress.');
                    }
                } else if(data.status === 'success'){
                    this.setState({
                        verifyCode_view: true,
                        newPassword_view: true,
                        emailSendButtonDisable: true,
                    });
                    if(self.state.selected_language === 1) {
                        Alert.alert('Notice!', 'Verification code has sent to your email. Please check your email.');
                    } else if(self.state.selected_language === 0) {
                        Alert.alert('Observera!', 'Verifieringskod har skickats till din mailadress.');
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
    }

    resendVerificationCode = async () => {
        this.setState({showIndicator: true});
        self = this;
        await fetch('https://safetyzonemessage.com/api/auth/forget-password', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
        
                },
                body: JSON.stringify({
                    'email': self.state.email,
                })
            })
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                if(data.status === 'fail') {
                    if(self.state.selected_language === 1) {
                        Alert.alert("Please notice!", 'There is no user for this email.');
                    } else if(self.state.selected_language === 0) {
                        Alert.alert("Observera!", 'Det finns ingen användare med denna mailadress.');
                    }
                } else if(data.status === 'success'){
                    if(self.state.selected_language === 1) {
                        Alert.alert('Notice!', 'Verification code has sent to your email. Please check your email.');
                    } else if(self.state.selected_language === 0) {
                        Alert.alert('Observera!', 'Verifieringskod har skickats till din mailadress.');
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
    }

    sendVerificationCode = async () => {
        // alert(this.state.verificationCode);
        
        this.setState({showIndicator: true});
        self = this;
        await fetch('https://safetyzonemessage.com/api/auth/validate-password-reset', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
        
                },
                body: JSON.stringify({
                    'email': self.state.email,
                    'code': self.state.verificationCode,
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if(data.status === 'fail') {
                    if(data.error_type === 'invalide_code') {
                        if(self.state.selected_language === 1) {
                            Alert.alert('Please notice!', 'Invalid verification code.');
                        } else if(self.state.selected_language === 0) {
                            Alert.alert('Observera!', 'Felaktig verifieringskod.');
                        }
                    } else if(data.error_type === 'code_expired') {
                        if(self.state.selected_language === 1) {
                            Alert.alert('Please notice!', 'Verification code is expired. Please request reset code again.');
                        } else if(self.state.selected_language === 0) {
                            Alert.alert('Observera!', 'Verifieringskoden har löpt ut. Vänligen be om ny återställningskod igen.');
                        }
                        
                    } else {
                        if(self.state.selected_language === 1) {
                            Alert.alert("Please notice!", 'There is something wrong in server.');
                        } else if(this.state.selected_language === 0) {
                            Alert.alert("Observera!", 'Något är fel med servern.');
                        }
                    }
                } else if(data.status === 'success'){
                    if(self.state.selected_language === 1) {
                        Alert.alert('Notice!', 'Please reset password.');
                    } else if(self.state.selected_language === 0) {
                        Alert.alert('Observera!', 'Återställ lösenord');
                    }
                    self.setState({
                        newPassword_view: true,
                        verificationCodeSendButtonDisable: true,
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
    }

    setNewPassword = async () => {

        if(this.state.newPassword === '') {
            if(this.state.selected_language === 1) {
                Alert.alert('Please notice!', 'The Password is required.');
            } else if(this.state.selected_language === 0) {
                Alert.alert('Observera!', 'Fyll i Lösenord.');
            }
            
            return;
        };
        if(this.state.newPassword !== this.state.confirmPassword) {
            if(this.state.selected_language === 1) {
                Alert.alert('Please notice!', 'Password does not match. Please try again.');
            } else {
                Alert.alert('Observera!', 'Lösenorden matchar inte, försök igen.');
            }
            
            return;
        }
        if(this.state.newPassword.length < 6) {
            if(this.state.selected_language === 1) {
                Alert.alert('Please notice!', 'The Password must be at least 6 characters.');
            } else if(this.state.selected_language === 0) {
                Alert.alert('Observera!', 'Lösenordet måste vara minst 6 tecken.');
            }
            
            return;
        };

        this.setState({showIndicator: true});
        const self = this;
        await fetch('https://safetyzonemessage.com/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'email': self.state.email,
                    'password': self.state.newPassword,
                    'code': self.state.verificationCode,
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if(data.status === 'fail') {
                    if(self.state.selected_language === 1) {
                        Alert.alert("Please notice!", 'There is something wrong in server.');
                    } else if(this.state.selected_language === 0) {
                        Alert.alert("Observera!", 'Något är fel med servern.');
                    }
                } else if(data.status === 'success'){
                    if(self.state.selected_language === 1) {
                        Alert.alert('Notice', 'The password has changed successfully.',
                        [
                            // {text: 'Cancel', onPress: null},
                            {text: 'OK', onPress: () => self.props.navigation.navigate('SignIn')}
                        ],
                        { cancelable: true })
                    } else if(self.state.selected_language === 0) {
                        Alert.alert('Observera', 'Lösenordet har uppdaterats.',
                        [
                            // {text: 'Cancel', onPress: null},
                            {text: 'OK', onPress: () => self.props.navigation.navigate('SignIn')}
                        ],
                        { cancelable: true })
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
                <TouchableOpacity style = {styles.back_button_view} onPress = {() => this.goSignIn()}>
                    <View style = {{width: 12, height: '100%'}}>
                        <Image style = {{width: '100%', height: '100%'}} resizeMode = 'contain' source = {require('../assets/images/left_arrow.png')}/>
                    </View>
                    {/* <View style = {{width: '70%', height: '100%', justifyContent: 'center', marginLeft: 5}}>
                        <Text style = {{fontSize: 12, color: '#ffffff', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}>{this.state.selected_language === 0 ? 'Logga In' : 'Sign in'}</Text>
                    </View> */}
                </TouchableOpacity>
                <View style = {styles.top_section}>
                    {/* <ImageBackground style = {{width: '100%', height: '100%', alignItems: 'center'}} resizeMode = {'stretch'} source = {require('../assets/images/top_head.png')}> */}
                        <Text style = {styles.title_text}>{this.state.selected_language === 0 ? 'Återställ lösenord' : 'Reset Password'}</Text>
                    {/* </ImageBackground> */}
                </View>
                <View style = {styles.marker_view}>
                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {require('../assets/images/activity_mark.png')}/>
                </View>
                <KeyboardAvoidingView behavior='padding'>
                    <ScrollView style = {{width: deviceWidth, marginTop: 40}} keyboardShouldPersistTaps='handled'>
                        <View style = {styles.main_section}>
                            <View style = {styles.component_view}>
                                <View style = {[styles.component_titleview, {height: '30%'}]}>
                                    <Text style = {styles.component_titletext}>{this.state.selected_language === 0 ? 'Ange din emailadress' : 'Please enter your email'}</Text>
                                </View>
                                <View style = {[styles.component_inputview, {height: '30%'}]}>
                                    <TextInput style = {styles.component_inputtext} underlineColorAndroid = 'transparent' onChangeText = {(typedText) => {this.setState({email: typedText})}}/>
                                </View>
                                <View style = {{width: '100%', height: '10%'}}></View>
                                <View style = {[styles.component_buttonview, {height: '30%'}]}>
                                    <TouchableOpacity style = {[styles.component_button, {width: '50%', opacity: this.state.emailSendButtonDisable ? 0.5 : 1}]} disabled = {this.state.emailSendButtonDisable} onPress = {() => this.sendEmail()}>
                                        <Text style = {styles.component_buttontext}>{this.state.selected_language === 0 ? 'Fortsätt' : 'Continue'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {/* <View style = {{width: '100%', height: '5%'}}></View> */}
                            {/* {
                                this.state.verifyCode_view &&
                                <View style = {styles.component_view}>
                                    <View style = {styles.component_titleview}>
                                        <Text style = {styles.component_titletext}>{this.state.selected_language === 0 ? 'Vänligen ange din verifikationskod' : 'Please enter your verification code.'}</Text>
                                    </View>
                                    <View style = {styles.component_inputview}>
                                        <TextInput style = {styles.component_inputtext} underlineColorAndroid = 'transparent' keyboardType = {'numeric'} onChangeText = {(typedText) => {this.setState({verificationCode: typedText})}}/>
                                    </View>
                                    <View style = {{width: '100%', height: '10%'}}></View>
                                    <View style = {[styles.component_buttonview, {justifyContent: 'space-around', flexDirection: 'row'}]}>
                                        <TouchableOpacity style = {[styles.component_button, {width: '40%', opacity: this.state.verificationCodeSendButtonDisable ? 0.5 : 1}]} disabled = {this.state.verificationCodeSendButtonDisable} onPress = {() => this.resendVerificationCode()}>
                                            <Text style = {styles.component_buttontext}>{this.state.selected_language === 0 ? 'Skicka igen' : 'Resend'}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style = {[styles.component_button, {width: '40%', opacity: this.state.verificationCodeSendButtonDisable ? 0.5 : 1}]} disabled = {this.state.verificationCodeSendButtonDisable} onPress = {() => this.sendVerificationCode()}>
                                            <Text style = {styles.component_buttontext}>{this.state.selected_language === 0 ? 'Ändra' : 'Continue'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            } */}
                            <View style = {{width: '100%', height: '5%'}}></View>
                            {
                                this.state.newPassword_view &&
                                <View style = {{width: '95%', height: '65%'}}>
                                    <View style = {styles.component_titleview}>
                                        <Text style = {styles.component_titletext}>{this.state.selected_language === 0 ? 'Vänligen ange din verifikationskod' : 'Please enter your verification code.'}</Text>
                                    </View>
                                    <View style = {styles.component_inputview}>
                                        <TextInput style = {styles.component_inputtext} underlineColorAndroid = 'transparent'secureTextEntry={true} onChangeText = {(typedText) => {this.setState({verificationCode: typedText})}}/>
                                    </View>
                                    <View style = {styles.component_titleview}>
                                        <Text style = {styles.component_titletext}>{this.state.selected_language === 0 ? 'Vänligen ange ditt nya lösenord' : 'Please enter your new password.'}</Text>
                                    </View>
                                    <View style = {styles.component_inputview}>
                                        <TextInput style = {styles.component_inputtext} underlineColorAndroid = 'transparent'secureTextEntry={true} onChangeText = {(typedText) => {this.setState({newPassword: typedText})}}/>
                                    </View>
                                    <View style = {styles.component_titleview}>
                                        <Text style = {styles.component_titletext}>{this.state.selected_language === 0 ? 'Vänligen upprepa lösenord' : 'Please confirm password.'}</Text>
                                    </View>
                                    <View style = {styles.component_inputview}>
                                        <TextInput style = {styles.component_inputtext} underlineColorAndroid = 'transparent'secureTextEntry={true} onChangeText = {(typedText) => {this.setState({confirmPassword: typedText})}}/>
                                    </View>
                                    <View style = {{width: '100%', height: '9%'}}></View>
                                    <View style = {styles.component_buttonview}>
                                        <TouchableOpacity style = {[styles.component_button, {width: '50%'}]} onPress = {() => this.setNewPassword()}>
                                            <Text style = {styles.component_buttontext}>{this.state.selected_language === 0 ? 'Välj lösenord' : 'Set Password'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            }
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
                
                {/* <View style = {styles.banner_section}>
                </View> */}
                
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
        // marginTop: 50,
        // marginLeft: 10,
        // marginRight: 10,
        marginBottom: 10,
        alignItems: 'center',
        // justifyContent: 'center',
    },
    component_view: {
        width: '95%',
        height: '30%',
    },
    component_titleview: {
        width: '100%', 
        height: '13%', 
        justifyContent: 'center'
    },
    component_titletext: {
        fontSize: 15, 
        color: '#ffffff', 
        fontFamily: 'coreSansBold', 
        paddingTop: Platform.OS === 'android' ? 0 : 7
    },
    component_inputview: {
        width: '100%', 
        height: '13%', 
        alignItems: 'center', 
        justifyContent: 'center', 
        borderBottomWidth: 1, 
        borderBottomColor: '#6e1ced'
    },
    component_inputtext: {
        width: '100%', 
        height: '80%', 
        color: '#ffffff', 
        fontSize: 15, 
        fontFamily: 'coreSansBold', 
        paddingTop: Platform.OS === 'android' ? 0 : 7
    },
    component_buttonview: {
        width: '100%', 
        height: '13%', 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    component_button: {
        // width: '50%', 
        height: '80%', 
        backgroundColor: '#ff4858', 
        alignItems: 'center', 
        justifyContent: 'center', 
        borderRadius: 10
    },
    component_buttontext: {
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
        backgroundColor: '#666665',
    },

    
});