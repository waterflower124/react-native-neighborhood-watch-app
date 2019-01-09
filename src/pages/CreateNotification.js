
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
    CameraRoll,
    Linking,
 } from 'react-native';

import {Font, Constants} from 'expo';

import Modal from 'react-native-modal';
import { ImagePicker, Permissions, ImageManipulator, FileSystem } from 'expo';

import Global, {
    CoreSnasCRLight,
    CoreSnasCRRegular,
    CoreSnasCRBold,
} from '../Global/Global'

import { BallIndicator } from 'react-native-indicators';
import Orientation from 'react-native-orientation'
import ImageResizer, { createResizedImage } from 'react-native-image-resizer';
import OneSignal from 'react-native-onesignal'; // Import package from node modules


var deviceWidth = Dimensions.get('window').width;
var deviceHight = Dimensions.get('window').height;
var bannerHeight = deviceHight * 0.1;
var topSectionHeight = 120;
var mainSectionHeight = deviceHight - (topSectionHeight + bannerHeight + 40);
var componentHeight = (deviceWidth - 40 - 15) / 2;///40 is for both side space, 15 is for space between component

export default class CreateNotification extends Component {
	static navigationOptions = {
		header: null,
	};

	constructor(props) {
        super(props);
        
        this.state = {
            isReady: false,
            showModal: false,
            modal_notification_type: '',
            notification_title: '',
            notification_contents: '',

            image_uris: [],
            image_ratioArray: [],

            showIndicator: false,

            selected_language: 1,////if 0 then Sweden, if 1 then English

            ads_image: '',
            ads_link: '',
            ads_id: -1,
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
        this.setState({showModal: false});
        var notification_id = openResult.notification.payload.additionalData.notification_id;
        this.props.navigation.navigate('ShowNotification', {notification_id: notification_id, backButtonAction: false});
            
    }

    componentDidMount() {
        this.props.navigation.addListener('willFocus', this.initLanguage.bind(this));
    }

    async componentWillMount() {

        console.log(deviceWidth + '' + deviceHight);

        await Expo.Font.loadAsync({
            coreSansLight: CoreSnasCRLight,
            coreSansRegular: CoreSnasCRRegular,
            coreSansBold: CoreSnasCRBold,
        });
        this.setState({isReady: true});

		// BackHandler.addEventListener('hardwareBackPress', () => {return true});
        // Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT);
        // Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.LANDSCAPE);
        // StatusBar.setHidden(true);

        // alert(deviceHight + " " + mainSectionHeight + " " + topSectionHeight + " " + bannerHeight);
        // Orientation.unlockAllOrientations();
        
    };

    goHome = () => {
        this.setState({ads_image: ''});
        this.props.navigation.navigate('Home');
        // alert("5555555");
    };

    createNotification = (index) => {
        // this.props.navigation.navigate('SignIn');

        // var icon_path = '';
        // var notification_type = '';
        switch (index) {
            case 0:
                this.setState({
                    modal_notification_type: 'Burglary',
                    showModal: true,
                });
                break;
            case 1:
                this.setState({
                    modal_notification_type: 'Fire and Smoke',
                    showModal: true,
                });
                break;
            case 2:
                this.setState({
                    modal_notification_type: 'Suspicious Activity',
                    showModal: true,
                });
                break;
            case 3:
                this.setState({
                    modal_notification_type: 'Other',
                    showModal: true,
                });
                break;
        }
    };

    closeModal = () => {
        this.setState({image_uris: [], 
            image_ratioArray: [], 
            showModal: false, 
            notification_contents: ''
        });
        // this.setState({showModal: false});
    }

    handleNotificationTitle = (typedText) => {
        this.setState({notification_title: typedText});
    };
    
    handleNotificationContents = (typedText) => {

        var contents;
        var regex = /\uD83C\uDFF4(?:\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74)\uDB40\uDC7F|\u200D\u2620\uFE0F)|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC68(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDB0-\uDDB3])|(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDB0-\uDDB3]))|\uD83D\uDC69\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDB0-\uDDB3])|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\uD83D\uDC68(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|(?:(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)\uFE0F|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDD6-\uDDDD])(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\u200D[\u2640\u2642])|\uD83D\uDC69\u200D[\u2695\u2696\u2708])\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D\uDC68(?:\u200D(?:(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D[\uDC66\uDC67])|\uD83C[\uDFFB-\uDFFF])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDB0-\uDDB3])|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF4\uD83C\uDDF2|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDB5\uDDB6\uDDD1-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDEEB\uDEEC\uDEF4-\uDEF9]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD70\uDD73-\uDD76\uDD7A\uDD7C-\uDDA2\uDDB0-\uDDB9\uDDC0-\uDDC2\uDDD0-\uDDFF])|(?:[#*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEF9]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD70\uDD73-\uDD76\uDD7A\uDD7C-\uDDA2\uDDB0-\uDDB9\uDDC0-\uDDC2\uDDD0-\uDDFF])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC69\uDC6E\uDC70-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD26\uDD30-\uDD39\uDD3D\uDD3E\uDDB5\uDDB6\uDDB8\uDDB9\uDDD1-\uDDDD])/g
        if(regex.test(typedText) === true) {
            contents = typedText.replace(regex, '');
            if(self.state.selected_language === 1) {
                Alert.alert('Please notice!', "Don't use emojis");
            } else {
                Alert.alert('Observera!', "Använd inte emojis i meddelandet.");
            }
            
        } else {
            contents = typedText;
        }
        
        this.setState({notification_contents: contents}, () => {console.log(this.state.notification_contents)});
    };

    takePhotoFromGallery = async() => {
        
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: false,
            // width: '100%',
            // height: '100%',
            aspect: [1, 1],
        });
      
        if (!result.cancelled) {
            this.setState({showIndicator: true});
            // var resizedPhoto;
            // if((result.width < result.height)) {
            //     resizedPhoto = await ImageManipulator.manipulate(result.uri, [{ resize: { height: 1024 }}], { format: 'jpeg', compress: 0.5});
            // } else if((result.width >= result.height)) {
            //     resizedPhoto = await ImageManipulator.manipulate(result.uri, [{ resize: { width: 1024 }}], { format: 'jpeg', compress: 0.5});
            // };

            // self = this;
            // setTimeout(function(){
            //     self.setState({showIndicator: false});
            //     var ratio = resizedPhoto.width / resizedPhoto.height;
            //     self.setState({ image_uris: [...self.state.image_uris, resizedPhoto.uri]});
            //     self.setState({ image_ratioArray: [...self.state.image_ratioArray, ratio]});
            // }, 2000);
            var newPhoto;
            if((result.width < result.height)) {
                newPhoto = await ImageManipulator.manipulate(result.uri, [{ resize: { height: 1024 }}], { format: 'jpeg', compress: 0.5});
            } else if((result.width >= result.height)) {
                newPhoto = await ImageManipulator.manipulate(result.uri, [{ resize: { width: 1024 }}], { format: 'jpeg', compress: 0.5});
            } else {
                newPhoto = result;
            };

            var isLandscape = false;
            if(result.width > result.height) {
                isLandscape = true;
            } else {
                isLandscape = false;
            };
            var isLandscapeNewPhoto = false;
            if(newPhoto.width > newPhoto.height) {
                isLandscapeNewPhoto = true;
            } else {
                isLandscapeNewPhoto = false;
            };
            var resizedPhoto;
            if(isLandscape !== isLandscapeNewPhoto) {
                if((result.width < result.height)) {
                    resizedPhoto = await ImageManipulator.manipulate(result.uri, [{rotate: 90},{ resize: { height: 1024 }}], { format: 'jpeg', compress: 0.5});
                } else if((result.width >= result.height)) {
                    resizedPhoto = await ImageManipulator.manipulate(result.uri, [{rotate: 90},{ resize: { width: 1024 }}], { format: 'jpeg', compress: 0.5});
                }
            } else {
                resizedPhoto = newPhoto;
            };
            self = this;
            setTimeout(function(){
                self.setState({showIndicator: false});
                var ratio = resizedPhoto.width / resizedPhoto.height;
                self.setState({ image_uris: [...self.state.image_uris, resizedPhoto.uri]});
                self.setState({ image_ratioArray: [...self.state.image_ratioArray, ratio]});
            }, 2000);
        }
    };

    takePhotoFromCamera = async() => {
        var image_width = 0;
        var image_height = 0;
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            // width: 200,
            // height: 350,
            aspect: [1, 1],
        });
      
        if (!result.cancelled) {
            this.setState({showIndicator: true});
            
            var newPhoto;
            if((result.width < result.height)) {
                newPhoto = await ImageManipulator.manipulate(result.uri, [{ resize: { height: 1024 }}], { format: 'jpeg', compress: 0.5});
            } else if((result.width >= result.height)) {
                newPhoto = await ImageManipulator.manipulate(result.uri, [{ resize: { width: 1024 }}], { format: 'jpeg', compress: 0.5});
            } else {
                newPhoto = result;
            };

            var isLandscape = false;
            if(result.width > result.height) {
                isLandscape = true;
            } else {
                isLandscape = false;
            };
            var isLandscapeNewPhoto = false;
            if(newPhoto.width > newPhoto.height) {
                isLandscapeNewPhoto = true;
            } else {
                isLandscapeNewPhoto = false;
            };
            var resizedPhoto;
            if(isLandscape !== isLandscapeNewPhoto) {
                if((result.width < result.height)) {
                    resizedPhoto = await ImageManipulator.manipulate(result.uri, [{rotate: 90},{ resize: { height: 1024 }}], { format: 'jpeg', compress: 0.5});
                } else if((result.width >= result.height)) {
                    resizedPhoto = await ImageManipulator.manipulate(result.uri, [{rotate: 90},{ resize: { width: 1024 }}], { format: 'jpeg', compress: 0.5});
                }
            } else {
                resizedPhoto = newPhoto;
            }
            
            setTimeout(function() {
                self.setState({showIndicator: false});
                var ratio = resizedPhoto.width / resizedPhoto.height;
                self.setState({ image_uris: [...self.state.image_uris, resizedPhoto.uri]});
                self.setState({ image_ratioArray: [...self.state.image_ratioArray, ratio]});
            }, 2000);
        }
    };

    deleteImageFromImagesURI = (delete_image_index) => {
        var image_array = [...this.state.image_uris];
        image_array.splice(delete_image_index, 1);
        this.setState({image_uris: image_array});

        var imageRatio_array = [...this.state.image_ratioArray];
        imageRatio_array.splice(delete_image_index, 1);
        this.setState({image_ratioArray: imageRatio_array});
    };

    sendNotification = async() => {
        // console.log(this.state.image_uris.length + '   this is create notification');
        const contents = this.state.notification_contents;
        if(contents.trim().length === 0) {
            if(self.state.selected_language === 1) {
                Alert.alert('Please notice!', 'Please input notification contents.');
            } else if(self.state.selected_language === 0) {
                Alert.alert('Observera!', 'Du måste skriva en text i ditt meddelande');
            };
            return;
        }

        var formData = new FormData();
        if(this.state.image_uris.length > 0) {
            this.state.image_uris.forEach((element, index) => {
                // console.log(element);
                var localUriNamePart = element.split('/');
                var fileName = localUriNamePart[localUriNamePart.length - 1];
                var localUriTypePart = element.split('.');
                var fileType = localUriTypePart[localUriTypePart.length - 1];

                const newImage = {
                   uri: element,
                   name: fileName,
                   type: `image/${fileType}`,
                }
                formData.append('images[]', newImage);
            });
        };
        // console.log(formData);
        switch(this.state.modal_notification_type) {
            case 'Burglary':
                formData.append('type', 1);
                break;
            case 'Fire and Smoke':
                formData.append('type', 2);
                break;
            case 'Suspicious Activity':
                formData.append('type', 3);
                break;
            case 'Other':
                formData.append('type', 4);
                break;
        };
        
        formData.append('contents', this.state.notification_contents);
        // console.log(this.state.notification_contents + ':::');
        var day = new Date().getDate();
        var month = new Date().getMonth() + 1;
        var year = new Date().getFullYear(); 
        var sec = new Date().getSeconds();
        var min = new Date().getMinutes();
        var hour = new Date().getHours();

        if (month < 10 ) month = '0' + month;
        if (day < 10 ) day = '0' + day;
        if (hour < 10 ) hour = '0' + hour;
        if (min < 10 ) min = '0' + min;
        if (sec < 10 ) sec = '0' + sec;
        // console.log(year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec)
        const datetime = year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec;

        formData.append('datetime', datetime);
// console.log(this.state.notification_contents + ':::' + this.state.modal_notification_type + ':::' + datetime);
        this.setState({showIndicator: true});
        self = this;
        await fetch('https://safetyzonemessage.com/api/create-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': 'Bearer ' + Global.token,
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                if(data.status === 'fail') {
                    if(data.error_type === 'image_type_error') {
                        if(self.state.selected_language === 1) {
                            Alert.alert('Please notice!', 'Attached images format must be in jpeg, png, jpg.');
                        } else if(self.state.selected_language === 0) {
                            Alert.alert('Observera!', 'Bifogat bildformat måste vara jpeg,  png eller jpg');
                        }
                    } else {
                        if(self.state.selected_language === 1) {
                            Alert.alert("Please notice!", 'There is something wrong in server.');
                        } else if(self.state.selected_language === 0) {
                            Alert.alert("Observera!", 'Något är fel med servern.');
                        }
                    }
                } else if(data.status === 'success') {
                    self.setState({
                        image_uris: [], 
                        image_ratioArray: [], 
                        showModal: false, 
                        showIndicator: false, 
                        notification_contents: ''
                    });
                    self.props.navigation.navigate('ShowNotification', {notification_id: data.notification_id, backButtonAction: false});
                }
            })
            .catch(function(error) {
                console.log(error);
                if(self.state.selected_language === 1) {
                    Alert.alert("Please notice!", 'Network Error!',
                        [
                            {text: 'OK', onPress: () => self.setState({showIndicator: false})}
                        ],
                        { cancelable: false }
                    );
                } else if(self.state.selected_language === 0) {
                    Alert.alert("Observera!", 'Nätverksproblem.',
                        [
                            {text: 'OK', onPress: () => self.setState({showIndicator: false})}
                        ],
                        { cancelable: false }
                    );
                }
            })

        this.setState({showIndicator: false});
    };

    render() {
        if (!this.state.isReady) {
            return <Expo.AppLoading/>;
        }
        return (
            <View style={styles.container}>
                <TouchableOpacity style = {styles.back_button_view} onPress = {() => this.goHome()}>
                    <View style = {{width: 12, height: '100%'}}>
                        <Image style = {{width: '100%', height: '100%'}} resizeMode = 'contain' source = {require('../assets/images/left_arrow.png')}/>
                    </View>
                    {/* <View style = {{width: '70%', height: '100%', justifyContent: 'center', marginLeft: 3}}>
                        <Text style = {{fontSize: 12, color: '#ffffff', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}>{this.state.selected_language === 0 ? 'Hem' : 'Home'}</Text>
                    </View> */}
                </TouchableOpacity>
                <View style = {styles.top_section}>
                    {/* <ImageBackground style = {{width: '100%', height: '100%', alignItems: 'center'}} resizeMode = {'stretch'} source = {require('../assets/images/top_head.png')}> */}
                        <Text style = {styles.title_text}> {this.state.selected_language === 0 ? 'Skapa meddelande' : 'Create Notification'} </Text>
                    {/* </ImageBackground> */}
                </View>
                <View style = {styles.marker_view}>
                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {require('../assets/images/notification_mark.png')}/>
                </View>
                <View style = {styles.main_section}>
                    <View style = {styles.subcontainer}>
                        <View style = {{width: '50%', height: '100%', alignItems: 'flex-start', justifyContent: 'center'}}>
                            <TouchableOpacity style = {styles.component} onPress = {() => this.createNotification(0)}>
                                <View style = {styles.icon_view}>
                                    <Image style = {styles.icon_style} resizeMode = {'contain'} source = {require('../assets/images/burglary.png')}/>
                                </View>
                                <View style = {styles.text_view}>
                                    <Text style = {styles.component_text}> {this.state.selected_language === 0 ? 'Inbrott' : 'Burglary'} </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style = {{width: '50%', height: '100%', alignItems: 'flex-end', justifyContent: 'center'}}>
                            <TouchableOpacity style = {styles.component} onPress = {() => this.createNotification(1)}>
                                <View style = {styles.icon_view}>
                                    <Image style = {styles.icon_style} resizeMode = {'contain'} source = {require('../assets/images/fire_smoke.png')}/>
                                </View>
                                <View style = {styles.text_view}>
                                    <Text style = {styles.component_text}> {this.state.selected_language === 0 ? 'Brand och rök' : 'Fire and Smoke'} </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style = {styles.subcontainer}>
                        <View style = {{width: '50%', height: '100%', alignItems: 'flex-start', justifyContent: 'center'}}>
                            <TouchableOpacity style = {styles.component} onPress = {() => this.createNotification(2)}>
                                <View style = {styles.icon_view}>
                                    <Image style = {styles.icon_style} resizeMode = {'contain'} source = {require('../assets/images/suspicious.png')}/>
                                </View>
                                <View style = {styles.text_view}>
                                    <Text style = {styles.component_text}> {this.state.selected_language === 0 ? 'Misstänkt' : 'Suspicous'} </Text>
                                    <Text style = {styles.component_text}> {this.state.selected_language === 0 ? 'aktivitet' : 'Activity'} </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style = {{width: '50%', height: '100%', alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                            <TouchableOpacity style = {styles.component} onPress = {() => this.createNotification(3)}>
                                <View style = {styles.icon_view}>
                                    <Image style = {styles.icon_style} resizeMode = {'contain'} source = {require('../assets/images/emergency_call.png')}/>
                                </View>
                                <View style = {styles.text_view}>
                                    <Text style = {styles.component_text}> {this.state.selected_language === 0 ? 'Övrigt' : 'Other'} </Text>
                                    {/* <Text style = {styles.component_text}> {this.state.selected_language === 0 ? '' : 'Help'} </Text> */}
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <TouchableOpacity style = {styles.banner_section} onPress = {() => this.onClickAds()}>
                {
                    (this.state.ads_image !== '')&&
                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {{uri: this.state.ads_image}}/>
                }
                </TouchableOpacity>

                <Modal isVisible = {this.state.showModal} style = {styles.modal} onBackButtonPress = {() => this.setState({showModal: false})} avoidKeyboard = {false}>
                {
                    this.state.showIndicator &&
                    <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', opacity: 0.5, zIndex: 1000}}>
                        <View style = {{flex: 1}}>
                            <BallIndicator color = '#ffffff' size = {50} count = {8}/>
                        </View>
                    </View>
                }
                    <View style = {{width: 50, height: 50, top: 0, right: 0, position: 'absolute', zIndex: 10}}>
                        <TouchableOpacity style = {{width: '100%', height: '100%'}} onPress = {() => this.closeModal()}>
                            <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/notification_close.png')}/>
                        </TouchableOpacity>
                    </View>
                    <View style = {styles.modalContainer}>
                        <View style = {styles.modal_header}>
                            <ImageBackground style = {{width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center'}} resizeMode = {'stretch'} source = {require('../assets/images/top_head.png')}>
                                <View style = {{width: '100%', height: '60%', alignItems: 'center', justifyContent: 'center'}}>
                                {
                                    (this.state.modal_notification_type == 'Burglary') && 
                                    <Image style = {{width: '100%', height: '80%',}} resizeMode = {'contain'} source = {require('../assets/images/notification_burglary.png')}/>
                                }
                                {
                                    (this.state.modal_notification_type == 'Fire and Smoke') && 
                                    <Image style = {{width: '100%', height: '80%'}} resizeMode = {'contain'} source = {require('../assets/images/notification_fire_smoke.png')}/>
                                }
                                {
                                    (this.state.modal_notification_type == 'Suspicious Activity') && 
                                    <Image style = {{width: '100%', height: '80%'}} resizeMode = {'contain'} source = {require('../assets/images/notification_suspicious.png')}/>
                                }
                                {
                                    (this.state.modal_notification_type == 'Other') && 
                                    <Image style = {{width: '100%', height: '80%'}} resizeMode = {'contain'} source = {require('../assets/images/notofication_help112.png')}/>
                                }
                                </View>
                                <View style = {{width: '100%', height: '40%', alignItems: 'center', justifyContent: 'center'}}>
                                {
                                    (this.state.selected_language === 1) &&
                                    <Text style = {{color: '#ffffff', fontSize: 20, fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 10}}> {this.state.modal_notification_type} </Text>
                                }
                                {
                                    (this.state.selected_language === 0) && (this.state.modal_notification_type == 'Burglary') && 
                                    <Text style = {{color: '#ffffff', fontSize: 20, fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 10}}> Inbrott </Text>
                                }
                                {
                                    (this.state.selected_language === 0) && (this.state.modal_notification_type == 'Fire and Smoke') && 
                                    <Text style = {{color: '#ffffff', fontSize: 20, fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 10}}> Brand och rök </Text>
                                }
                                {
                                    (this.state.selected_language === 0) && (this.state.modal_notification_type == 'Suspicious Activity') && 
                                    <Text style = {{color: '#ffffff', fontSize: 20, fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 10}}> Misstänkt aktivitet </Text>
                                }
                                {
                                    (this.state.selected_language === 0) && (this.state.modal_notification_type == 'Other') && 
                                    <Text style = {{color: '#ffffff', fontSize: 20, fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 10}}> Övrigt </Text>
                                }
                                </View>
                            </ImageBackground>
                        </View>
                        {/* <View style = {styles.notification_title}>
                            <TextInput underlineColorAndroid = 'transparent' style = {{width: '90%', fontSize: 20, fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 10}} onChangeText = {this.handleNotificationTitle} placeholder = {'Notification Title'}/>
                        </View> */}
                        <View style = {styles.notification_textContents} onStartShouldSetResponder = {() => {this.refs.contents_ref.focus();}}>
                            <View style = {{width: '90%', height: '100%', borderBottomColor: '#8219ed', borderBottomWidth: 1,}}>
                                <View style = {{width: '100%', height: '90%', alignItems: 'center'}}>
                                    <ScrollView showsVerticalScrollIndicator = {false} style = {{width: '100%', height: '100%'}}>
                                        <TextInput underlineColorAndroid = 'transparent' ref = 'contents_ref' 
                                            style = {{width: '100%', fontSize: 15, fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 7}} 
                                            multiline = {true} 
                                            onChangeText = {this.handleNotificationContents} 
                                            placeholder = {this.state.selected_language === 0 ? 'Skriv ditt meddelande här' : 'Write your message here'} 
                                            keyboardType={Platform.OS === 'android' ? 'email-address' : 'ascii-capable'}
                                            value = {this.state.notification_contents}/>
                                    </ScrollView>
                                </View>
                            </View>
                        </View>
                        <View style = {styles.notification_showPictures}>
                            <View style = {{width: '90%', height: '20%', justifyContent: 'center'}}>
                                <Text style = {{fontSize: 15, fontFamily: 'coreSansBold', color: '#C7C7CD', paddingTop: Platform.OS === 'android' ? 0 : 10}}> {this.state.selected_language === 0 ? 'Bifogade bilder' : 'Attached Pictures'} </Text>
                            </View>
                            <ScrollView style = {{width: '90%', height: '80%'}} horizontal = {true} showsHorizontalScrollIndicator = {false}>
                                <View style = {{width: '100%', height: '100%', flexDirection: 'row', alignItems: 'center'}}>
                                {
                                    (this.state.image_uris.length != 0) &&
                                    this.state.image_uris.map((item, index) => 
                                        // <View key = {index} style = {{width:100, height:'90%', marginRight: 5, borderRadius: 10, overflow: 'hidden', backgroundColor: '#aaaaaa'}}>
                                            // <ImageBackground source={{ uri: item }} resizeMode = {'contain'} style={{ width: '100%', height: '100%' }}>
                                            <ImageBackground key = {index} source={{ uri: item }} resizeMode = {'contain'} style={{height: '100%', aspectRatio: this.state.image_ratioArray[index], flex: 1, marginRight: 5, borderRadius: 10, overflow: 'hidden'}}>
                                                <TouchableOpacity style = {{right: 5, top: 5, width: 20, height: 20, position: 'absolute'}} onPress = {() => this.deleteImageFromImagesURI(index)}>
                                                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/cancel.png')}/>
                                                </TouchableOpacity>
                                            </ImageBackground>
                                        // </View>
                                    )
                                }
                                {/* {
                                    (this.state.image_uris.length == 0) &&
                                    <Text style = {{fontSize: 20, color: '#808080', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 10}}> No Pictures</Text>
                                } */}
                                </View>
                            </ScrollView>
                        </View>
                        <View style = {styles.notification_getPictures}>
                            <View style = {styles.selection_component_view}>
                                <TouchableOpacity style = {styles.selection_icon_view} onPress = {() => this.takePhotoFromCamera()}>
                                    <Image style = {{width: '100%', height: '90%'}} resizeMode = {'contain'} source = {require('../assets/images/notification_picture_camera.png')}/>
                                </TouchableOpacity>
                                <View style = {styles.selection_type_text_view}>
                                    <Text style = {styles.selection_type_text}> {this.state.selected_language === 0 ? 'Ta en bild' : 'Take a Photo'} </Text>
                                </View>
                            </View>
                            <View style = {styles.selection_component_view}>
                                <TouchableOpacity style = {styles.selection_icon_view} onPress = {() => this.takePhotoFromGallery()}>
                                    <Image style = {{width: '100%', height: '90%'}} resizeMode = {'contain'} source = {require('../assets/images/notification_picture_gallery.png')}/>
                                </TouchableOpacity>
                                <View style = {styles.selection_type_text_view}>
                                    <Text style = {styles.selection_type_text}> {this.state.selected_language === 0 ? 'Från galleriet' : 'From Gallery'} </Text>
                                </View>
                            </View>
                        </View>
                        <View style = {styles.notification_buttonview}>
                                <TouchableOpacity style = {styles.notification_button} onPress = {() => this.sendNotification()}>
                                    <Text style = {styles.button_text}> {this.state.selected_language === 0 ? 'Skicka' : 'Notify the Group Now'} </Text>
                                </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                
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
        marginTop: 50,
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
        // justifyContent: 'center',
    },
    subcontainer: {
        width: deviceWidth - 40,
        height: componentHeight,
        flexDirection: 'row',
        marginBottom: 15,
        // justifyContent: 'center',
        // alignItems: 'center',
    },
    component: {
        width: componentHeight,
        height: componentHeight,
        backgroundColor: '#0a0f2c',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon_view: {
        width: '100%',
        height: '50%',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '10%',
    },
    icon_style: {
        width: '100%',
        height: '70%',
    },
    text_view: {
        width: '100%',
        height: '40%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    component_text: {
        fontSize: 15,
        color: '#bfc1d1',
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
    modal: {
        // width: '100%',
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
        height: '17%',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        overflow: 'hidden'
    },
    // notification_title: {
    //     width: '100%',
    //     height: '7%',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    // },
    notification_textContents: {
        width: '100%',
        height: '30%',
        alignItems: 'center',
        justifyContent: 'center',
        
    },
    notification_showPictures: {
        width: '100%',
        height: '28%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    notification_getPictures: {
        width: '100%',
        height: '15%',
        flexDirection: 'row',
    },
    selection_component_view: {
        width: '50%', 
        height: '90%', 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    selection_icon_view: {
        width: '60%', 
        height: '70%', 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    selection_type_text_view: {
        width: '100%', 
        height: '30%', 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    selection_type_text: {
        fontSize: 15, 
        color: '#a3a7b3',
        fontFamily: 'coreSansBold',
        paddingTop: Platform.OS === 'android' ? 0 : 7
    },
    notification_buttonview: {
        width: '100%',
        height: '10%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    notification_button: {
        width: '80%',
        height: '80%',
        borderRadius: 20,
        backgroundColor: '#ff4858',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button_text: {
        fontSize: 15,
        color: '#ffffff',
        fontFamily: 'coreSansBold',
        paddingTop: Platform.OS === 'android' ? 0 : 7
    }
    
});