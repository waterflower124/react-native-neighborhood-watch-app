
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
    Keyboard,
    Share,
    Linking,
 } from 'react-native';

import {Font, Constants} from 'expo';
import { ImagePicker, Permissions } from 'expo';

import {
    CoreSnasCRLight,
    CoreSnasCRRegular,
    CoreSnasCRBold,
} from '../Global/Global'

import Global from '../Global/Global';
import OneSignal from 'react-native-onesignal'; // Import package from node modules

import Orientation from 'react-native-orientation'

// import ScalableImage from '../components/scalableImage/ScalableImage';
// import ScalableImage from 'react-native-scalable-image';

var deviceWidth = Dimensions.get('window').width;
var deviceHight = Dimensions.get('window').height;
var bannerHeight = deviceHight * 0.1;
var topSectionHeight = 120;
var input_comment_height = 40;
var input_image_height =  120;
var mainSectionHeight = deviceHight - (topSectionHeight + bannerHeight + input_comment_height + 40 + 20);//// 50: radius of marker , 20: for seperate line.
var componentHeight = (deviceWidth - 30) / 2;

export default class ShowNotification extends Component {
	static navigationOptions = {
		header: null,
	};

	constructor(props) {
        super(props);
        
        this.state = {

            isReady: false,
            selectedImage: this.props.navigation.state.params.selectedImage,
            imageRatio: this.props.navigation.state.params.imageRatio,

            selected_language: 1,////if 0 then Sweden, if 1 then English

            orientation: '',

            devicewidth: deviceWidth,
            deviceheight: deviceHight,
            deviceratio: deviceWidth / (deviceHight - 50),
        };
    };

    initLanguage() {
        this.setState({selected_language: Global.language});
        this.onOpened = this.onOpened.bind(this);

        this.oneSignalEventListener = OneSignal.addEventListener('opened', this.onOpened);
    };

    onOpened(openResult) {
        var notification_id = openResult.notification.payload.additionalData.notification_id;
        console.log('display image: ' + notification_id);
        this.props.navigation.state.params.updataID({notification_id: notification_id});
        this.props.navigation.navigate('ShowNotification', {notification_id: notification_id, backButtonAction: true});
            
    }

    async componentDidMount() {
        this.props.navigation.addListener('willFocus', this.initLanguage.bind(this));
        // this.orientationListener = Orientation.addOrientationListener(this._onOrientationChanged);

        Dimensions.addEventListener('change', this.orientationMode.bind(this));

        // this.backButtonListener = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }

    orientationMode = async() => {
        var width_ori = await Dimensions.get('window').width;
        var height_ori = await Dimensions.get('window').height;
        if(!this.isUnmounted) {
            this.setState({
                devicewidth: width_ori,
                deviceheight: height_ori,
                deviceratio: width_ori / (height_ori - 50),
            });
        }
    }

    async componentWillUnmount() {
        // this.dimensionListener.remove();
        // Dimensions.removeEventListener('change', this.orientationMode.bind(this));
        this.isUnmounted = true;
        // this.backButtonListener.remove();
    }

    async componentWillMount() {

        await Expo.Font.loadAsync({
            coreSansLight: CoreSnasCRLight,
            coreSansRegular: CoreSnasCRRegular,
            coreSansBold: CoreSnasCRBold,
        });
        this.setState({isReady: true});

		// BackHandler.addEventListener('hardwareBackPress', () => {return true});
		Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.ALL);

        // alert(this.state.selectedImage);
    };


    shareImage = () => {
        // this.setState({showFullImageFlag: true});
        // this.props.navigation.navigate('DisplayingImage');
        // console.log(';;;;;' + this.state.orientation + ':::::')
        if(Platform.OS == 'ios') {
            Share.share({
                // title: 'aaaaa',
                // message: 'bbbbbb',
                url: this.state.selectedImage,
            })
        } else if (Platform.OS == 'android') {
            Share.share({
                // title: 'aaaaa',
                message: this.state.selectedImage,
                url: this.state.selectedImage,
            })
        }

    };
    
    render() {
        if (!this.state.isReady) {
            return <Expo.AppLoading/>;
        }
        return (
            <View style={styles.container}>
                <View style = {{width: '100%', height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}} >
                    <View style = {{width: '50%', height: '100%', alignItems: 'flex-start', justifyContent: 'center'}}>
                        <TouchableOpacity style = {{height: '100%', aspectRatio: 1, alignItems: 'flex-start', justifyContent: 'center', marginLeft: 10, marginTop: 15}} onPress = {() => {this.props.navigation.navigate('ShowNotification', {backButtonAction: true})}}>
                            {/* <Text style = {{fontSize: 15, color: '#ffffff', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 7}}> {this.state.selected_language === 0 ? 'återvända' : 'Return'} </Text> */}
                            <Image style = {{width: '30%', height: '30%'}} resizeMode = 'contain' source = {require('../assets/images/left_arrow.png')}/>
                        </TouchableOpacity>
                    </View>
                    
                    <View style = {{width: '50%', height: '100%', alignItems: 'flex-end', justifyContent: 'center'}}>
                        <TouchableOpacity style = {{height: '100%', aspectRatio: 1, alignItems: 'flex-end', justifyContent: 'center', marginRight: 10, marginTop: 15}} onPress = {() => {this.shareImage()}}>
                            {/* <Text style = {{fontSize: 15, color: '#ffffff', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 7}}> {this.state.selected_language === 0 ? 'Aktie' : 'Share'} </Text> */}
                            <Image style = {{width: '30%', height: '30%'}} resizeMode = 'contain' source = {require('../assets/images/share.png')}/>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style = {{width: '100%', height: this.state.deviceheight - 50, justifyContent: 'center', alignItems: 'center'}}>
                {/* <ScrollView contentContainerStyle = {{flexGrow: 1, justifyContent : 'center'}} showsVerticalScrollIndicator = {false}> */}
                    {/* <ScalableImage style = {{borderRadius: 10}} width = {deviceWidth} source = {{uri: this.state.selectedImage}}>
                    </ScalableImage> */}
                    <TouchableOpacity onPress = {() => {this.props.navigation.navigate('ShowNotification')}} activeOpacity = {1}>
                    {
                        (this.state.imageRatio > this.state.deviceratio) &&
                        <Image style = {{width: this.state.devicewidth, aspectRatio: this.state.imageRatio, borderRadius: 10, overflow: 'hidden'}} source = {{uri: this.state.selectedImage}}/>
                    }
                    {
                        !(this.state.imageRatio > this.state.deviceratio) &&
                        <Image style = {{height: (this.state.deviceheight - 50), aspectRatio: this.state.imageRatio, borderRadius: 10, overflow: 'hidden'}} source = {{uri: this.state.selectedImage}}/>
                    }
                    </TouchableOpacity>
                {/* </ScrollView> */}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#392b59',
		alignItems: 'center',
        justifyContent: 'center',
    },
    

    
});