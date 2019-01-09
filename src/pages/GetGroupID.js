
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
    ActivityIndicator,
    Linking,
 } from 'react-native';

import {Font, Constants} from 'expo';

import Global, {
    CoreSnasCRLight,
    CoreSnasCRRegular,
    CoreSnasCRBold,
} from '../Global/Global'

import { BallIndicator } from 'react-native-indicators';

// import Global from '../Global';

var deviceWidth = Dimensions.get('window').width;
var deviceHight = Dimensions.get('window').height;
var bannerHeight = deviceHight * 0.1;
var topSectionHeight = 120;
// var mainSectionHeight = deviceHight - (topSectionHeight + bannerHeight + 40);
var mainSectionHeight = deviceHight - (topSectionHeight + 40);

export default class GetGroupID extends Component {
	static navigationOptions = {
		header: null,
	};

	constructor(props) {
        super(props);
        
        this.state = {
            isReady: false,
            groupName: '',
            organizationNumber: '',
            personName: '',
            mobileNumber: '',
            email: '',

            showIndicator: false,

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

    backToSignIn = () => {
        this.props.navigation.navigate('SignIn');
    }

    handleGroupName = (typedText) => {
        this.setState({groupName: typedText});
    };

    handleOrgamizationNumber = (typedText) => {
        this.setState({organizationNumber: typedText});
    };

    handlePersonName = (typedText) => {
        this.setState({personName: typedText});
    };

    handleMobileNumber = (typedText) => {
        this.setState({mobileNumber: typedText});
    };

    handleEmail = (typedText) => {
        this.setState({email: typedText});
    };

    getGroupID = async() => {
        var status = true;
        if(this.state.groupName === '') {
            if(this.state.selected_language === 1) {
                Alert.alert('Please notice!', 'The Group name is required.');
            } else if(this.state.selected_language === 0) {
                Alert.alert('Observera!', 'Fyll i Gruppnamn.');
            }
            return;
        }
        if(this.state.organizationNumber === '') {
            if(this.state.selected_language === 1) {
                Alert.alert('Please notice!', 'The Organization number is required.');
            } else if(this.state.selected_language === 0) {
                Alert.alert('Observera!', 'Fyll i organisationsnummer.');
            }
            
            return;
        }
        if(this.state.personName === '') {
            if(this.state.selected_language === 1) {
                Alert.alert('Please notice!', 'Your Name is required.');
            } else if(this.state.selected_language === 0) {
                Alert.alert('Observera!', 'Fyll i ditt namn.');
            }
            
            return;
        }
        if(this.state.mobileNumber === '') {
            if(this.state.selected_language === 1) {
                Alert.alert('Please notice!', 'The Mobile number is required.');
            } else if(this.state.selected_language === 0) {
                Alert.alert('Observera!', 'Fyll i ditt mobilnummer.');
            }
            
            return;
        }
        if(this.state.email === '') {
            if(this.state.selected_language === 1) {
                Alert.alert('Please notice!', 'The Email is required.');
            } else if(this.state.selected_language === 0) {
                Alert.alert('Observera!', 'Fyll i din emailadress.');
            }
            
            return;
        }

        this.setState({showIndicator: true});
        self = this;
        await fetch('https://safetyzonemessage.com/api/auth/register', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
        
                },
                body: JSON.stringify({
                    'group_name': self.state.groupName,
                    'org_number': self.state.organizationNumber,
                    'contact_person': self.state.personName,
                    'phone_number': self.state.mobileNumber,
                    'email': self.state.email,
                })
            })
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                self.setState({showIndicator: false});
                if(data.status === 'fail') {
                    if(data.error_type === 'email_resistered') {
                        if(self.state.selected_language === 1) {
                            Alert.alert('Please notice!', 'The Email already exist. Please try again with other email.');
                        } else if(self.state.selected_language === 0) {
                            Alert.alert('Observera!', 'Det finns redan ett konto med denna emailadress.');
                        }
                    } else {
                        if(self.state.selected_language === 1) {
                            Alert.alert("Please notice!", 'Failed Register. Please try again');
                        } else if(self.state.selected_language === 0) {
                            Alert.alert('Observera!', 'Registrering misslyckades, var god försök igen.');
                        }
                        
                    }
                } else if(data.status === 'success'){
                    if(self.state.selected_language === 1) {
                        Alert.alert("Notice", "Your Group ID will be send to your email within 24 hours.",
                            [
                                {text: 'OK', onPress: () => self.props.navigation.navigate('SignIn')}
                            ],
                            { cancelable: true }
                        );
                    } else if(self.state.selected_language === 0) {
                        Alert.alert("Observera", "Ditt grupp-ID skickas normalt inom 24-timmar.",
                            [
                                {text: 'OK', onPress: () => self.props.navigation.navigate('SignIn')}
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
                    <View style = {{width: '70%', height: '100%', justifyContent: 'center', marginLeft: 10}}>
                        <Text style = {{fontSize: 12, color: '#ffffff', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}>{this.state.selected_language === 0 ? 'Logga In' : 'Sign in'}</Text>
                    </View>
                </TouchableOpacity>
                <View style = {styles.top_section}>
                    {/* <ImageBackground style = {{width: '100%', height: '100%', alignItems: 'center'}} resizeMode = {'stretch'} source = {require('../assets/images/top_head.png')}> */}
                        <Text style = {styles.title_text}> {this.state.selected_language === 0 ? 'Registrera Förening' : 'Get GroupID'} </Text>
                    {/* </ImageBackground> */}
                </View>
                <View style = {styles.marker_view}>
                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {require('../assets/images/logo_blue.png')}/>
                </View>
                <KeyboardAvoidingView behavior='padding'>
                    <ScrollView style = {{width: deviceWidth, marginTop: 40}} keyboardShouldPersistTaps='handled'>
                        <View style = {styles.main_section}>
                            <View style = {{width: '95%', height: '85%', alignItems: 'center'}}>
                            {/* <ScrollView style = {{width: '100%', height: '100%'}}> */}
                                {/* <View style = {{marginLeft: 10, marginRight: 10}}> */}
                                <View style = {styles.component_view}>
                                    <View style = {styles.input_box}>
                                        <View style = {styles.input_box_title_view}>
                                            <View style = {styles.icon_view}>
                                                <Image style = {[styles.icon, {width: '60%'}]} resizeMode = 'contain' source = {require('../assets/images/group.png')}/>
                                            </View>
                                            <View style = {styles.input_title_view}>
                                                <Text style = {styles.input_title_text}> {this.state.selected_language === 0 ? 'Grupp Namn' : 'Group Name'} </Text>
                                            </View>
                                        </View>
                                        <View style = {styles.input_box_content_view}>
                                            <TextInput underlineColorAndroid = 'transparent' style = {styles.input_box_content_text} placeholder = 'Name of the Brf' onChangeText = {this.handleGroupName}/>
                                        </View>
                                    </View>
                                </View>
                                <View style = {styles.component_view}>
                                    <View style = {styles.input_box}>
                                        <View style = {styles.input_box_title_view}>
                                            <View style = {styles.icon_view}>
                                                <Image style = {styles.icon} resizeMode = 'contain' source = {require('../assets/images/office_phone.png')}/>
                                            </View>
                                            <View style = {styles.input_title_view}>
                                                <Text style = {styles.input_title_text}> {this.state.selected_language === 0 ? 'Org Nummer' : 'Organization Number'} </Text>
                                            </View>
                                        </View>
                                        <View style = {styles.input_box_content_view}>
                                            <TextInput underlineColorAndroid = 'transparent' style = {styles.input_box_content_text} keyboardType = {'phone-pad'} placeholder = 'Organization number of the Brf' onChangeText = {this.handleOrgamizationNumber}/>
                                        </View>
                                    </View>
                                </View>
                                <View style = {styles.component_view}>
                                    <View style = {styles.input_box}>
                                        <View style = {styles.input_box_title_view}>
                                            <View style = {styles.icon_view}>
                                                <Image style = {[styles.icon, {width: '50%'}]} resizeMode = 'contain' source = {require('../assets/images/name.png')}/>
                                            </View>
                                            <View style = {styles.input_title_view}>
                                                <Text style = {styles.input_title_text}> {this.state.selected_language === 0 ? 'Kontak Person' : 'Contact person'} </Text>
                                            </View>
                                        </View>
                                        <View style = {styles.input_box_content_view}>
                                            <TextInput underlineColorAndroid = 'transparent' style = {styles.input_box_content_text} placeholder = 'Your name' onChangeText = {this.handlePersonName}/>
                                        </View>
                                    </View>
                                </View>
                                <View style = {styles.component_view}>
                                    <View style = {styles.input_box}>
                                        <View style = {styles.input_box_title_view}>
                                            <View style = {styles.icon_view}>
                                                <Image style = {styles.icon} resizeMode = 'contain' source = {require('../assets/images/mobile_number.png')}/>
                                            </View>
                                            <View style = {styles.input_title_view}>
                                                <Text style = {styles.input_title_text}> {this.state.selected_language === 0 ? 'Mobil Nummer' : 'Mobile number'} </Text>
                                            </View>
                                        </View>
                                        <View style = {styles.input_box_content_view}>
                                            <TextInput underlineColorAndroid = 'transparent' style = {styles.input_box_content_text} keyboardType = {'phone-pad'} placeholder = 'Your mobile number' onChangeText = {this.handleMobileNumber}/>
                                        </View>
                                    </View>
                                </View>
                                <View style = {styles.component_view}>
                                    <View style = {styles.input_box}>
                                        <View style = {styles.input_box_title_view}>
                                            <View style = {styles.icon_view}>
                                                <Image style = {[styles.icon, {width: '60%'}]} resizeMode = 'contain' source = {require('../assets/images/email_black.png')}/>
                                            </View>
                                            <View style = {styles.input_title_view}>
                                                <Text style = {styles.input_title_text}> {this.state.selected_language === 0 ? 'Epost' : 'Email'} </Text>
                                            </View>
                                        </View>
                                        <View style = {styles.input_box_content_view}>
                                            <TextInput underlineColorAndroid = 'transparent' style = {styles.input_box_content_text} placeholder = 'Your email address' onChangeText = {this.handleEmail}/>
                                        </View>
                                    </View>
                                </View>
                                {/* </View> */}
                                {/* </ScrollView> */}
                            </View>
                            <View style = {styles.signout_button_view}>
                                <TouchableOpacity style = {styles.signout_button} onPress = {() => this.getGroupID()}>
                                    <Text style = {{color: '#ffffff', fontSize: 15, fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 7}}> {this.state.selected_language === 0 ? 'Skicka' : 'Submit'} </Text>
                                </TouchableOpacity>
                            </View> 
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
        height: mainSectionHeight,
        // backgroundColor: '#555555',
        // marginTop: 40,
        alignItems: 'center',
    },
    component_view: {
        width: '100%',
        height: '20%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    input_box: {
        width: '100%',
        height: '80%',
        // marginBottom: 10,
        alignItems: 'center', 
        justifyContent: 'center'
        
    },
    input_box_title_view: {
        width: '100%',
        height: '40%',
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
        height: '60%',
        borderBottomColor: '#6e1ced',
        borderBottomWidth: 1,
        justifyContent: 'center',
    },
    input_box_content_text: {
        fontSize: 15,
        marginLeft: 15,
        fontFamily: 'coreSansBold',
        paddingTop: Platform.OS === 'android' ? 0 : 7,
    },
    signout_button_view: {
        width: '100%',
        height: '15%',
        alignItems: 'center',
        justifyContent: 'space-around',
        // marginTop: 100,
        // flexDirection: 'row',
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