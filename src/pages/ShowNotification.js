
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
    Linking,
 } from 'react-native';

import {Font, Constants} from 'expo';
import { ImagePicker, Permissions, ImageManipulator } from 'expo';

import Global, {
    CoreSnasCRLight,
    CoreSnasCRRegular,
    CoreSnasCRBold,
} from '../Global/Global'

import { BallIndicator } from 'react-native-indicators';

import OneSignal from 'react-native-onesignal'; // Import package from node modules


var deviceWidth = Dimensions.get('window').width;
var deviceHight = Dimensions.get('window').height;
var bannerHeight = deviceHight * 0.1;
var topSectionHeight = 120;
var input_comment_height = 40;
var input_image_height =  120;
var mainSectionHeight = deviceHight - (topSectionHeight + bannerHeight + input_comment_height + 40 + 20);//// 50: radius of marker , 20: for seperate line.
var mainSectionHeight_without_input = deviceHight - (topSectionHeight + bannerHeight + 40 + 20);//// 50: radius of marker , 20: for seperate line.
var componentHeight = (deviceWidth - 30) / 2;


var current_fetching_data = false;
const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = 0;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
};


export default class ShowNotification extends Component {
	static navigationOptions = {
		header: null,
	};

	constructor(props) {
        super(props);
        
        this.state = {

            isReady: false,

            keyboardHeight: 0,

            parentScrollenabled: true, //parent Scroll View scroll enabled, if this is false then child scroll may be true, and IT'S FOR ANDROID

            group_manager: false,

            my_avatar: '',
            
            // notification_id: this.props.navigation.state.params.notification_id,//db index for the current selected activity

            activityType: 'Fire and Smoke',
            post_user_email: '',////// DB index for this post user
            // post_time: 'Sep 02 - 4: 02 pm',
            post_time: '',
            post_userAvatar: '',
            // post_username: 'Patrick Cox',
            post_username: '',
            // post_street_address: '459 Clinton Lane Bartlett',
            post_street_address: '',
            // post_street_number: 'II. 60103',
            post_street_number: '',
            // post_phonenumber: '202-555-0133',
            post_phonenumber: '',
            // post_message: "Lorem lpsum is simply dummy text of the printing and typesetting industry. Lorem lpsum is simply dummy text Lorem lpsum is simply dummy text of the printing and typesetting industry. Lorem lpsum is simply dummy text of the printing and typesetting industry. Lorem lpsum has beed the industy's standard dummy text over since the 1500s, when an unknown printor took a gallery of they and ...",
            post_message: '',
            // post_imagesArray: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTk0ZS-mzIXylbTyBx7tlfIIhmEoakDPtgPtp0K_JK2KZe4zozi',
            //     'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIsk5nWVjXsgQERUeDE9qUoyeJvdEJOiyAx65qKNWghOyU-1gYrA',
            //     'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_IriZ3USxNaRDvvQZ17gZhNuaYiSQMprOgCZpFvYRjx7uVvmD'],
            post_imagesArray: [],
            post_image_ratioArray: [],

            // comment_array: [['comment_post_user1_image_url', 'Lorem lpsum is simply dummy text of the printing and typesetting industry. Lorem lpsum has beed the industys standard dummy text over since the 1500s, when an unknown printor took a gallery of they and ...', ['comment containt image1 url', 'comment containt image2 url']], 
            //     ['comment_post_user2_image_url', 'Lorem lpsum is simply dummy text of the printing and typesetting industry. Lorem lpsum has beed the industy', []],
            //     ['comment_post_user3_image_url', 'comment text', ['comment containt image1 url', 'comment containt image2 url', 'comment containt image3 url']]],
            comment_array: [],

            editMessage_flag: false,///if edit true, else false that is only view

            input_comment_change_height: 0,////bottom input box height

            new_comment_message: '',
            new_comment_image_urls: [],
            new_comment_image_ratioArray: [],

            showFullImageFlag: false,//// use for user click attached image so show full size image

            selected_language: 1,////if 0 then Sweden, if 1 then English

            showIndicator: false,

            month_array_english: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            month_array_sweden: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],

            ads_image: '',
            ads_link: '',
            ads_id: -1,

            scrollviewToEnd: false,

            comment_fetch_index: 0,
            comment_last: false,

            backButtonAction: this.props.navigation.state.params.backButtonAction,
        };

    };

    async componentWillMount() {

        await Expo.Font.loadAsync({
            coreSansLight: CoreSnasCRLight,
            coreSansRegular: CoreSnasCRRegular,
            coreSansBold: CoreSnasCRBold,
        });
        this.setState({isReady: true});

    };

    getNotificationDetail = async() => {
        // var notification_id = this.props.navigation.state.params.notification_id;
        // this.setState({notification_id: this.props.navigation.state.params.notification_id});
        var notification_id = this.state.notification_id;
        // this.setState({
        //     post_imagesArray: [],
        //     post_image_ratioArray: [],
        //     comment_array: []
        // })

        this.setState({showIndicator: true});
        self = this;
        await fetch('https://safetyzonemessage.com/api/get-notification-detail', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + Global.token,
                },
                body: JSON.stringify({
                    'notification_id': notification_id,
                    'page': this.state.comment_fetch_index
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log("notification ID::" + notification_id);
                console.log(data);
                if(data.status === 'fail') {
                    if(self.state.selected_language === 1) {
                        Alert.alert("Please notice!", 'There is something wrong in server.');
                    } else if(self.state.selected_language === 0) {
                        Alert.alert("Observera!", 'Något är fel med servern.');
                    }
                } else if(data.status === 'success'){
                    self.setState({
                        group_manager: Global.group_manager,
                    });
                    if(this.state.comment_fetch_index === 0) {
                        self.setState({my_avatar: data.my_avatar});

                        var notification_array = data.notification;

                        self.setState({notification_group_id: notification_array[0].group_id});

                        var token = [];
                        var subtoken1 = [];
                        var subtoken2 = [];
                        var create_date = notification_array[0].created_at;
                        token = create_date.split(' ');
                        subtoken1 = token[0].split('-');
                        subtoken2 = token[1].split(':');
                        if(Global.language === 1) {
                            self.setState({
                                post_time: subtoken1[0] + ' ' + self.state.month_array_english[parseInt(subtoken1[1], 10) - 1] + ' ' + subtoken1[2] + ' ' + subtoken2[0] + ':' + subtoken2[1],
                            });
                        } else {
                            self.setState({
                                post_time: subtoken1[0] + ' ' + self.state.month_array_sweden[parseInt(subtoken1[1], 10) - 1] + ' ' + subtoken1[2] + ' ' + subtoken2[0] + ':' + subtoken2[1],
                            });
                        }

                        self.setState({
                            activityType: notification_array[0].type,
                            // post_time: notification_array[0].created_at,
                            post_user_email: notification_array[0].user.email,
                            // post_username: notification_array[0].user.simple_profile.first_name + ' ' + notification_array[0].user.simple_profile.family_name,
                            
                            // post_street_address: notification_array[0].user.simple_profile.street_address,
                            // post_street_number: notification_array[0].user.profile.street_number,
                            post_message: notification_array[0].contents,
                        });
                        if(notification_array[0].type === '5') {
                            self.setState({
                                post_username: 'Safety Zone',
                                post_street_address: '',
                            });
                        } else {
                            self.setState({
                                post_username: notification_array[0].user.simple_profile.first_name + ' ' + notification_array[0].user.simple_profile.family_name,
                                post_street_address: notification_array[0].user.simple_profile.street_address,
                            });
                        }
                        if(notification_array[0].user.simple_profile.avatar === '') {
                            self.setState({
                                post_userAvatar: '',
                            });
                        } else {
                            self.setState({
                                post_userAvatar: 'https://safetyzonemessage.com/images/users/' + notification_array[0].user.simple_profile.avatar,
                            });
                        }

                        var imagesArray = notification_array[0].images;
                        if(imagesArray.length > 0) {
                            for(i = 0; i < imagesArray.length; i ++) {
                                var ratio = imagesArray[i].width / imagesArray[i].height;
                                self.setState({ 
                                    post_imagesArray: [...self.state.post_imagesArray, 'https://safetyzonemessage.com/images/notifications/' + imagesArray[i].url],
                                    post_image_ratioArray: [...self.state.post_image_ratioArray, ratio],
                                });
                            }
                        } else {
                            self.setState({
                                post_imagesArray: []
                            });
                        }
                    };
                    this.setState({comment_last: data.end});
                    var comment_item = [];
                    var comment_item_imagesArray = [];
                    var comment_item_imagesRatioArray = [];
                    var commentsArray = data.comments;

                    var token_comment = [];
                    var subtoken1_comment = [];
                    var subtoken2_comment = [];
                    var create_date_comment = [];
                    var create_date_comment_formatted = [];

                    if(commentsArray.length > 0) {
                        for(i = 0; i < commentsArray.length; i ++) {
                            if(commentsArray[i].user === null) {
                                continue;
                            }
                            comment_item_imagesArray = [];
                            comment_item_imagesRatioArray = [];
                            if(commentsArray[i].images.length > 0) {
                                for(j = 0; j < commentsArray[i].images.length; j ++) {
                                    comment_item_imagesArray.push('https://safetyzonemessage.com/images/notifications/' + commentsArray[i].images[j].url)
                                    var ratio = commentsArray[i].images[j].width / commentsArray[i].images[j].height;
                                    comment_item_imagesRatioArray.push(ratio);
                                }
                            } else {
                                comment_item_imagesArray = [];
                                comment_item_imagesRatioArray = [];
                            }
                            create_date_comment = commentsArray[i].created_at;
                            token_comment = create_date_comment.split(' ');
                            subtoken1_comment = token_comment[0].split('-');
                            subtoken2_comment = token_comment[1].split(':');
                            if(Global.language === 1) {
                                create_date_comment_formatted = subtoken1_comment[0] + ' ' + self.state.month_array_english[parseInt(subtoken1_comment[1], 10) - 1] + ' ' + subtoken1_comment[2] + ' ' + subtoken2_comment[0] + ':' + subtoken2_comment[1];
                            } else {
                                create_date_comment_formatted = subtoken1_comment[0] + ' ' + self.state.month_array_sweden[parseInt(subtoken1_comment[1], 10) - 1] + ' ' + subtoken1_comment[2] + ' ' + subtoken2_comment[0] + ':' + subtoken2_comment[1];
                            }
                            if(commentsArray[i].user.simple_profile.avatar === '') {
                                comment_item = ['', commentsArray[i].contents, comment_item_imagesArray, comment_item_imagesRatioArray, commentsArray[i].user.email, commentsArray[i].id, create_date_comment_formatted, commentsArray[i].user.simple_profile.first_name + ' ' + commentsArray[i].user.simple_profile.family_name, commentsArray[i].user.simple_profile.street_address];
                            } else {
                                comment_item = ['https://safetyzonemessage.com/images/users/' + commentsArray[i].user.simple_profile.avatar, commentsArray[i].contents, comment_item_imagesArray, comment_item_imagesRatioArray, commentsArray[i].user.email, commentsArray[i].id, create_date_comment_formatted, commentsArray[i].user.simple_profile.first_name + ' ' + commentsArray[i].user.simple_profile.family_name, commentsArray[i].user.simple_profile.street_address];
                            }
                            
                            self.setState({
                                comment_array: [...self.state.comment_array, comment_item]
                            });
                        }
                    } else {
                        self.setState({
                            comment_array:[],
                        });
                    }
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
    }

    comment_input_style_func = function() {
        if(this.state.editMessage_flag) {
            // if(this.state.editMessage_flag) {
                return {
                    width: '100%', 
                    height: Math.max(input_comment_height, this.state.input_comment_change_height), 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    position: 'absolute',
                    bottom: deviceHight * 0.1 + 10,
                }
            // }
        } else {
            if(this.state.keyboardHeight != 0) {
                return {
                    width: '100%', 
                    height: Math.max(input_comment_height, this.state.input_comment_change_height), 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    position: 'absolute',
                    bottom: this.state.keyboardHeight,
                }
            } else {
                return {
                    width: '100%', 
                    height: Math.max(input_comment_height, this.state.input_comment_change_height), 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    position: 'absolute',
                    bottom: deviceHight * 0.1 + 10,
                }
            }
        }
    };

    comment_image_view_style_func = function() {
        if(this.state.keyboardHeight != 0) {
            return {
                width: '100%', 
                height: input_image_height, 
                alignItems: 'center', 
                justifyContent: 'center', 
                bottom: this.state.keyboardHeight + Math.max(input_comment_height, this.state.input_comment_change_height), 
                position: 'absolute',
                
            }
        } else {
            return {
                width: '100%', 
                height: input_image_height, 
                alignItems: 'center', 
                justifyContent: 'center', 
                // bottom: input_comment_height + bannerHeight + 10, 
                bottom: Math.max(input_comment_height, this.state.input_comment_change_height) + bannerHeight + 10,
                position: 'absolute'
            }
        }
    };

    initLanguage() {
        
        Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT);
        this.setState({selected_language: Global.language});

        this.onOpened = this.onOpened.bind(this);

        this.oneSignalEventListener = OneSignal.addEventListener('opened', this.onOpened);

        // this.setState({
        //     notification_id: this.props.navigation.state.params.notification_id,//db index for the current selected activity
        // });

        // if(!this.state.showIndicator) {
            // console.log("444444444444");
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
                        // Alert.alert('Please notice!', 'There is something wrong')
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
        // }

        if(!this.state.backButtonAction) {
            console.log('initial setting');
            this.setState({
                notification_id: this.props.navigation.state.params.notification_id,//db index for the current selected activity
                post_imagesArray: [],
                post_image_ratioArray: [],
                comment_array: []
            }, () => {
                this.getNotificationDetail();
            });
        } else {
        }

    };

    updateNotificationID = data => {
        // console.log('qwert:::' + id);
        this.setState(data);
        this.setState({
            post_imagesArray: [],
            post_image_ratioArray: [],
            comment_array: []
        }, () => {
            this.getNotificationDetail();
        })
        
    }

    componentDidMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));

        this.props.navigation.addListener('willFocus', this.initLanguage.bind(this));

    };

    onOpened(openResult) {
        var notification_id = openResult.notification.payload.additionalData.notification_id;
        console.log('lll:;::' + notification_id);
        this.setState({
            notification_id: notification_id,//db index for the current selected activity
            post_imagesArray: [],
            post_image_ratioArray: [],
            comment_array: [],
            comment_fetch_index: 0,
        }, () => {
            this.getNotificationDetail();
        });
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();

    }

    _keyboardDidShow(e) {
        this.setState({keyboardHeight: e.endCoordinates.height});
    }
    
    _keyboardDidHide(e) { 
         this.setState({keyboardHeight: 0});
    }

    goActivityLogpage = () => {
        this.setState({ads_image: ''});
        OneSignal.removeEventListener('opened', this.onOpened);
        this.props.navigation.navigate('ActivityLog');
    };

    editMessage = () => {
        this.setState({editMessage_flag: !this.state.editMessage_flag});
        this.setState({new_comment_message: '', new_comment_image_urls: []});
        // this.refs.post_message_ref.focus();
        Keyboard.dismiss();
    };

    saveMessage = async() => {
        Keyboard.dismiss();
        this.setState({showIndicator: true});
        self = this;
        await fetch('https://safetyzonemessage.com/api/update-notification', {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + Global.token,
                },
                body: JSON.stringify({
                    'notification_id': self.state.notification_id,
                    'contents': self.state.post_message,
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

                    self.setState({editMessage_flag: !this.state.editMessage_flag});
                    if(self.state.selected_language === 1) {
                        Alert.alert('Notice!', 'Notification message has updated successfully.');
                    } else {
                        Alert.alert('Observera!', 'Ditt meddelande har uppdaterats.');
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
        

        // alert(this.state.post_message);
    };

    handleMessageContents = (typedText) => {
        this.setState({post_message: typedText});
    };

    clickAttachedImage = (image_uri, ratio) => {
        this.setState({
            ads_image: '',
            backButtonAction: true
        });
        OneSignal.removeEventListener('opened', this.onOpened);
        this.props.navigation.navigate({key: 'DisplayingImage', routeName: 'DisplayingImage', params:{selectedImage: image_uri, imageRatio: ratio, updataID: this.updateNotificationID}});
    };

    handleNewComment = (typedText) => {
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
        this.setState({new_comment_message: contents});
    }

    addImageFromGallery = async() => {
        Keyboard.dismiss();
        let result = await Expo.ImagePicker.launchImageLibraryAsync({
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
            //     self.setState({ new_comment_image_urls: [...self.state.new_comment_image_urls, resizedPhoto.uri] });
            //     self.setState({ new_comment_image_ratioArray: [...self.state.new_comment_image_ratioArray, ratio]});
            // }, 2000);
            var newPhoto;
            if((result.width < result.height)) {
                newPhoto = await ImageManipulator.manipulate(result.uri, [{ resize: { height: 1024 }}], { format: 'jpeg', compress: 0.5});
            } else if((result.width >= result.height)) {
                newPhoto = await ImageManipulator.manipulate(result.uri, [{ resize: { width: 1024 }}], { format: 'jpeg', compress: 0.5});
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

            self = this;
            setTimeout(function(){
                self.setState({showIndicator: false});
                var ratio = resizedPhoto.width / resizedPhoto.height;
                self.setState({ new_comment_image_urls: [...self.state.new_comment_image_urls, resizedPhoto.uri]});
                self.setState({ new_comment_image_ratioArray: [...self.state.new_comment_image_ratioArray, ratio]});
            }, 2000);
        }
    };

    addImageFromCamera = async() => {
        Keyboard.dismiss();
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            // width: '100%',
            // height: '100%',
            aspect: [1, 1],
        });
      
        if (!result.cancelled) {
            this.setState({showIndicator: true});
            var newPhoto;
            if((result.width < result.height)) {
                newPhoto = await ImageManipulator.manipulate(result.uri, [{ resize: { height: 1024 }}], { format: 'jpeg', compress: 0.5});
            } else if((result.width >= result.height)) {
                newPhoto = await ImageManipulator.manipulate(result.uri, [{ resize: { width: 1024 }}], { format: 'jpeg', compress: 0.5});
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

            self = this;
            setTimeout(function(){
                self.setState({showIndicator: false});
                var ratio = resizedPhoto.width / resizedPhoto.height;
                self.setState({ new_comment_image_urls: [...self.state.new_comment_image_urls, resizedPhoto.uri]});
                self.setState({ new_comment_image_ratioArray: [...self.state.new_comment_image_ratioArray, ratio]});
            }, 2000);
        }
    };

    setEditMessageFlag = () => {
        if((Global.current_email == this.state.post_user_email)) {
            if(this.state.editMessage_flag) {
                this.setState({editMessage_flag: false});
            }
        }
    };

    onScrollEndEvent = () => {
        if(!current_fetching_data) {
            if(!this.state.comment_last) {
                console.log('22222');
                current_fetching_data = true;
                this.setState({ 
                    comment_fetch_index: this.state.comment_fetch_index + 1,
                }, () => {
                    this.getNotificationDetail();
                });
            }
        }
    };

    sendComment = async() => {
        Keyboard.dismiss();

        if(this.state.new_comment_message === '') {
            if(this.state.selected_language === 1) {
                Alert.alert('Please notice!', 'Please input comment contents!');
            } else {
                Alert.alert('Observera!', 'Var god fyll i ditt meddelande!');
            }
            return;
        }

        var formData = new FormData();
        if(this.state.new_comment_image_urls.length > 0) {
            this.state.new_comment_image_urls.forEach((element, index) => {
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

        formData.append('notification_id', this.state.notification_id);
        formData.append('contents', this.state.new_comment_message);

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

        this.setState({showIndicator: true});
        self = this;
        await fetch('https://safetyzonemessage.com/api/create-comment', {
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
                console.log(data);
                if(data.status === 'fail') {
                    if(data.error_type === 'image_type_error') {
                        if(self.state.selected_language === 1) {
                            Alert.alert('Please notice!', 'Attached images format must be in jpeg, png, jpg.');
                        } else {
                            Alert.alert('Observera!', 'Bifogat bildformat måste vara jpeg,  png eller jpg.');
                        }
                    } else {
                        if(self.state.selected_language === 1) {
                            Alert.alert("Please notice!", 'There is something wrong in server.');
                        } else if(self.state.selected_language === 0) {
                            Alert.alert("Observera!", 'Något är fel med servern.');
                        }
                    }
                } else if(data.status === 'success'){
                    // console.log(data);
                    var formatted_datetime = '';
                    if(Global.language === 1) {
                        formatted_datetime = year + ' ' + self.state.month_array_english[parseInt(month, 10) - 1] + ' ' + day + ' ' + hour + ':' + min;
                    } else {
                        formatted_datetime = year + ' ' + self.state.month_array_sweden[parseInt(month, 10) - 1] + ' ' + day + ' ' + hour + ':' + min;
                    }
                    var comment = [];
                    if(self.state.my_avatar === '') {
                        comment = ['', self.state.new_comment_message, self.state.new_comment_image_urls, self.state.new_comment_image_ratioArray, Global.current_email, data.comment_id, formatted_datetime, Global.fullname, Global.address];
                    } else {
                        comment = ['https://safetyzonemessage.com/images/users/' + self.state.my_avatar, self.state.new_comment_message, self.state.new_comment_image_urls, self.state.new_comment_image_ratioArray, Global.current_email, data.comment_id, formatted_datetime, Global.fullname, Global.address];
                    }
                    self.setState({
                        // comment_array: [...self.state.comment_array, comment]
                        comment_array: [...self.state.comment_array, comment]
                    });

                    self.setState({
                        new_comment_message: '', 
                        new_comment_image_urls: [],
                        new_comment_image_ratioArray: [],
                        scrollviewToEnd: true,
                    });

                    // self.scrollView.scrollTo({x: 0, y: 0, animated: true});
                    // self.scrollView.scrollToEnd({animated: true});

                }
            })
            .catch(function(error) {
                console.log('hhhhh' + error);
                if(self.state.selected_language === 1) {
                    Alert.alert('Please notice!', 'Network error.');
                } else if(self.state.selected_language === 0) {
                    Alert.alert('Observera!', 'Nätverksproblem.');
                }
            })

        this.setState({showIndicator: false});

    };
    
    scrollViewToEndFunction() {
        // console.log('eeeee');
        if(this.state.scrollviewToEnd) {
            this.scrollView.scrollToEnd({animated: true});
            this.setState({scrollviewToEnd: false});

        }
    }

    deleteImageFromNewComment = (delete_image_index) => {

        var image_array = [...this.state.new_comment_image_urls];
        image_array.splice(delete_image_index, 1);
        this.setState({new_comment_image_urls: image_array});

        var ratio_array = [...this.state.new_comment_image_ratioArray];
        ratio_array.splice(delete_image_index, 1);
        this.setState({new_comment_image_ratioArray: ratio_array});

    }

    deleteNotificationAlert() {
        if(self.state.selected_language === 1) {
            Alert.alert('Please notice!', 'Do you really delete this notification?',
            [
                {text: 'Cancel', onPress: null},
                {text: 'OK', onPress: () => {self.deleteNotification()}},
            ],
            { cancelable: true });
        } else {
            Alert.alert('Observera!', 'Ditt konto har raderats.',
            [
                {text: 'Avbryt', onPress: null},
                {text: 'OK', onPress: () => {self.deleteNotification()}},
            ],
            { cancelable: true });
        };
    }

    deleteNotification = async() => {
        Keyboard.dismiss();
        this.setState({showIndicator: true});
        self = this;
        await fetch('https://safetyzonemessage.com/api/notification-delete', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + Global.token,
                },
                body: JSON.stringify({
                    'notification_id': self.state.notification_id,
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
                    self.props.navigation.navigate('ActivityLog', {notification_id: self.state.notification_id, passingScreen: 'ShowNotification'});
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

    deleteNotificationImage = async(image_index) => {

        var image_url = this.state.post_imagesArray[image_index];
        var token = image_url.split('/');
        var filename = token[token.length - 1];

        Keyboard.dismiss();
        this.setState({showIndicator: true});
        self = this;
        await fetch('https://safetyzonemessage.com/api/notification-image-delete', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + Global.token,
                },
                body: JSON.stringify({
                    'notification_id': self.state.notification_id,
                    'url': filename
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

                    var image_array = [...self.state.post_imagesArray];
                    image_array.splice(image_index, 1);
                    self.setState({post_imagesArray: image_array});

                    var ratio_array = [...self.state.post_image_ratioArray];
                    ratio_array.splice(image_index, 1);
                    self.setState({post_image_ratioArray: ratio_array});
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

    deleteComment = async(comment_index) => {
        Keyboard.dismiss();
        this.setState({showIndicator: true});
        self = this;
        await fetch('https://safetyzonemessage.com/api/comment-delete', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + Global.token,
                },
                body: JSON.stringify({
                    'comment_id': self.state.comment_array[comment_index][5],
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

                    var array = [...self.state.comment_array];
                    array.splice(comment_index, 1);
                    self.setState({comment_array: array});
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
        this.setState({showIndicator: false});
    };

    deleteCommentImage = async(comment_index, image_index) => {
        // console.log(comment_index + '  ' + image_index);
        // this.state.comment_array[comment_index][2].splice(image_index, 1);
        // this.state.comment_array[comment_index][3].splice(image_index, 1);
        // this.setState({
        //     comment_array: this.state.comment_array,
        // })
        var image_url = this.state.comment_array[comment_index][2][image_index];
        var token = image_url.split('/');
        var filename = token[token.length - 1];
        Keyboard.dismiss();
        this.setState({showIndicator: true});
        self = this;
        await fetch('https://safetyzonemessage.com/api/comment-image-delete', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + Global.token,
                },
                body: JSON.stringify({
                    'comment_id': self.state.comment_array[comment_index][5],
                    'url': filename
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

                    self.state.comment_array[comment_index][2].splice(image_index, 1);
                    self.state.comment_array[comment_index][3].splice(image_index, 1);
                    self.setState({
                        comment_array: self.state.comment_array,
                    })
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

    renderCommentBox() {
        return (
            <View style = {{flex: 1}}>
            {
                (this.state.notification_group_id === Global.group_id) &&
                <View style = {{width: '100%', height: 0, alignItems: 'center', justifyContent: 'center'}}>
                    <View style = {{width: '95%', height:0, borderTopWidth: 1, borderTopColor: '#bfc1d1'}}></View>
                </View>
            }
            {
                (!this.state.editMessage_flag) && (this.state.new_comment_image_urls.length > 0) &&
                <View style = {this.comment_image_view_style_func()}>
                    <View style = {{width: '95%', height: '100%', borderRadius: 10, backgroundColor: '#0a0f2c', borderWidth: 1, borderColor: '#ffffff', overflow: 'hidden'}}>
                        <ScrollView style = {{width: '100%', height: input_image_height,}} horizontal = {true} showsHorizontalScrollIndicator = {false}>
                        {
                            (this.state.new_comment_image_urls.length > 0) &&
                            this.state.new_comment_image_urls.map((item, index) => 
                                <View key = {index} style = {{height: input_image_height, aspectRatio: this.state.new_comment_image_ratioArray[index], marginRight: 5, borderRadius: 10, overflow: 'hidden', }}>
                                    <ImageBackground source={{ uri: item }} resizeMode = {'contain'} style={{ width: '100%', height: '100%' }} >
                                        <TouchableOpacity style = {{right: 5, top: 5, width: 20, height: 20, position: 'absolute'}} onPress = {() => this.deleteImageFromNewComment(index)}>
                                            <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/cancel.png')}/>
                                        </TouchableOpacity>
                                    </ImageBackground>
                                </View>
                            )
                        }
                        </ScrollView>
                    </View>
                </View>
            }
            {
                (this.state.notification_group_id === Global.group_id) &&
                <View style = {this.comment_input_style_func()}>
                    <View style = {{width: '95%', height: Math.max(input_comment_height, this.state.input_comment_change_height), alignItems: 'flex-end', justifyContent: 'center', flexDirection: 'row'}}>
                        <View style = {{width: '85%', height: '100%', borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#5d1b88', flexDirection: 'row'}}>
                            <TextInput 
                                underlineColorAndroid = 'transparent' 
                                multiline={true} 
                                style = {{width: '70%', height: '100%', fontSize: 15, color: '#ffffff', fontFamily: 'coreSansLight', paddingTop: Platform.OS === 'android' ? 0 : 7}} 
                                onChangeText = {this.handleNewComment} 
                                onFocus = {() => this.setEditMessageFlag()}
                                onContentSizeChange = {(event) => {this.setState({input_comment_change_height: event.nativeEvent.contentSize.height})}}
                                keyboardType={Platform.OS === 'android' ? 'email-address' : 'ascii-capable'}
                            >

                                {this.state.new_comment_message}

                            </TextInput>
                            <View style = {{width: '25%', height: '100%', alignItems: 'flex-end', justifyContent: 'center', flexDirection: 'row'}}>
                                <TouchableOpacity style = {{width: deviceHight * 0.04, height: deviceHight * 0.056, alignItems: 'flex-start', justifyContent: 'center', }} onPress = {() => this.addImageFromGallery()}>
                                    <Image style = {{width: '80%', height: '80%'}} resizeMode = {'contain'} source = {require('../assets/images/send_comment_flip.png')}/>
                                </TouchableOpacity>
                                <TouchableOpacity style = {{width: deviceHight * 0.04, height: deviceHight * 0.056, alignItems: 'flex-end', justifyContent: 'center'}} onPress = {() => this.addImageFromCamera()}>
                                    <Image style = {{width: '80%', height: '80%'}} resizeMode = {'contain'} source = {require('../assets/images/send_comment_camera.png')}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <TouchableOpacity style = {{width: '15%', height: input_comment_height}} onPress = {() => this.sendComment()}>
                            <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/send_comment.png')}/>
                        </TouchableOpacity>
                    </View>
                </View>
            }
            </View>
        )
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
                <TouchableOpacity style = {styles.back_button_view} onPress = {() => this.goActivityLogpage()}>
                    <View style = {{width: 12, height: '100%'}}>
                        <Image style = {{width: '100%', height: '100%'}} resizeMode = 'contain' source = {require('../assets/images/left_arrow.png')}/>
                    </View>
                </TouchableOpacity>
                <View style = {styles.top_section}>
                    {
                        (this.state.activityType === '1') &&
                        <Text style = {styles.title_text}>{this.state.selected_language === 0 ? 'Inbrott' : 'Burglary'}</Text>
                    }
                    {
                        (this.state.activityType === '2') &&
                        <Text style = {styles.title_text}>{this.state.selected_language === 0 ? 'Brand och rök' : 'Fire and Smoke'}</Text>
                    }
                    {
                        (this.state.activityType === '3') &&
                        <Text style = {styles.title_text}>{this.state.selected_language === 0 ? 'Misstänkt aktivitet' : 'Suspicious Activity'}</Text>
                    }
                    {
                        (this.state.activityType === '4') &&
                        <Text style = {styles.title_text}>{this.state.selected_language === 0 ? 'Övrigt' : 'Other'}</Text>
                    }
                    {
                        (this.state.activityType === '5') &&
                        <Text style = {styles.title_text}>{this.state.selected_language === 0 ? 'Meddelande från Safety Zone' : 'Message from Safety Zone'}</Text>
                    }
                </View>
                <View style = {styles.marker_view}>
                {
                    (this.state.activityType === '1') &&
                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {require('../assets/images/activitylog_burglary.png')}/>
                }
                {
                    (this.state.activityType === '2') &&
                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {require('../assets/images/activitylog_fire.png')}/>
                }
                {
                    (this.state.activityType === '3') &&
                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {require('../assets/images/activitylog_suspicious.png')}/>
                }
                {
                    (this.state.activityType === '4') &&
                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {require('../assets/images/activitylog_help112.png')}/>
                }
                {
                    (this.state.activityType === '5') &&
                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {require('../assets/images/activity_server.jpg')}/>
                }
                </View>
                <View style = {[styles.main_section, (this.state.notification_group_id !== Global.group_id) ? {height: mainSectionHeight_without_input} : null]}>
                    <ScrollView showsVerticalScrollIndicator = {false} style = {{width: '95%'}} scrollEnabled = {this.state.parentScrollenabled} ref={scrollView => this.scrollView = scrollView}
                        onScroll={({nativeEvent}) => {
                            if(isCloseToBottom(nativeEvent)) {this.onScrollEndEvent()}
                        }} 
                        scrollEventThrottle={0}
                        onContentSizeChange={(contentWidth, contentHeight)=>{
                            this.scrollViewToEndFunction();
                        }}
                    >
                        <View style = {styles.post_user_info}>
                            <View style = {styles.post_user_picture_view}>
                            {
                                (this.state.activityType === '5') &&
                                <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/activity_server.jpg')}/>
                            }
                            {
                                (this.state.post_userAvatar === '') && (this.state.activityType !== '5') &&
                                <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/empty_picture.png')}/>
                            }
                            {
                                (this.state.post_userAvatar !== '') && (this.state.activityType !== '5') &&
                                <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {{uri: this.state.post_userAvatar}}/>
                            } 
                            </View>
                            <View style = {styles.post_user_text_view}>
                                <Text style = {styles.post_username}>{this.state.post_time}</Text>
                                <Text style = {styles.post_username}>{this.state.post_username}</Text>
                                <Text style = {styles.post_username}>{this.state.post_street_address}</Text>
                            </View>
                        </View>
                        <View style = {{width: '100%', height: 30, alignItems: 'flex-end', justifyContent: 'center', marginTop: 10}}>
                            {
                                (Global.current_email === this.state.post_user_email) && (this.state.activityType !== '5') &&
                                <View style = {{width: '60%', height: '100%'}}>
                                {
                                    (!this.state.editMessage_flag) && 
                                    <View style = {{height: '100%', width: '100%', justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row'}}>
                                        <TouchableOpacity style = {{height: '70%', marginRight: 15}} onPress = {() => this.editMessage()}>
                                            <Text style = {{fontSize: 15, color: '#ffffff', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 7}}>{this.state.selected_language === 0 ? 'Redigera' : 'Edit'}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style = {{height: '70%', marginRight: 10}} onPress = {() => this.deleteNotification()}>
                                            <Text style = {{fontSize: 15, color: '#ffffff', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 7}}>{this.state.selected_language === 0 ? 'Radera' : 'Delete'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                }
                                {
                                    (this.state.editMessage_flag) && 
                                    <View style = {{height: '100%', width: '100%', justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row'}}>
                                        <TouchableOpacity style = {{height: '70%', marginRight: 10}} onPress = {() => this.saveMessage()}>
                                            <Text style = {{fontSize: 15, color: '#ffffff', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 7}}>{this.state.selected_language === 0 ? 'Spara' : 'Save'}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style = {{height: '70%', marginRight: 10}} onPress = {() => this.deleteNotification()}>
                                            <Text style = {{fontSize: 15, color: '#ffffff', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 7}}>{this.state.selected_language === 0 ? 'Radera' : 'Delete'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                }
                                </View>
                            }
                            {
                                (Global.current_email !== this.state.post_user_email) && (this.state.group_manager) && (this.state.activityType !== '5') &&
                                <View style = {{width: '60%', height: '100%'}}>
                                    <View style = {{height: '100%', width: '100%', justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row'}}>
                                        <TouchableOpacity style = {{height: '70%', marginRight: 10}} onPress = {() => this.deleteNotification()}>
                                            <Text style = {{fontSize: 15, color: '#ffffff', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 7}}>{this.state.selected_language === 0 ? 'Radera' : 'Delete'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            }
                        </View>
                        {
                            (!this.state.editMessage_flag) && 
                            <Text style = {{width: '100%', fontSize: 15, color: '#ffffff', fontFamily: 'coreSansLight', paddingTop: Platform.OS === 'android' ? 0 : 7}} multiline = {true}>{this.state.post_message}</Text>
                        }
                        {
                            (this.state.editMessage_flag) && 
                            <TextInput underlineColorAndroid = 'transparent' autoFocus = {true} autoCorrect = {true} style = {{width: '100%', fontSize: 15, color: '#ffffff', fontFamily: 'coreSansLight', paddingTop: Platform.OS === 'android' ? 0 : 7}} multiline = {true} onChangeText = {this.handleMessageContents}>{this.state.post_message}</TextInput>
                        }
                        {
                            !(this.state.post_imagesArray.length === 0) &&
                            <View style = {{width: '100%', marginTop: 10}}>
                                {
                                    this.state.post_imagesArray.map((item, index) => 
                                        <TouchableOpacity key = {index} onPress = {() => this.clickAttachedImage(item, this.state.post_image_ratioArray[index])} activeOpacity = {1}>
                                            <ImageBackground style = {{width: deviceWidth * 0.95, aspectRatio: this.state.post_image_ratioArray[index], marginBottom: 10, borderRadius: 10, overflow: 'hidden'}} source = {{uri: item}}>
                                                {
                                                    (Global.current_email === this.state.post_user_email)&&
                                                    <TouchableOpacity style = {{right: 10, top: 10, width: 30, height: 30, position: 'absolute'}} onPress = {() => this.deleteNotificationImage(index)}>
                                                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/cancel.png')}/>
                                                    </TouchableOpacity>
                                                }
                                            </ImageBackground>
                                        </TouchableOpacity>
                                    )
                                }
                            </View>
                        }
                        {
                            (this.state.comment_array.length > 0) &&
                            this.state.comment_array.map((item, index) => 
                                <View key = {index} style = {{width: '100%'}}>
                                    <View style = {{width: '100%', marginTop: 10, flexDirection: 'row'}}>
                                        <View style = {{width: 70, height: 70, borderRadius: 10, overflow: 'hidden'}}>
                                        {
                                            (item[0] === '') &&
                                            <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/empty_avatar.png')}/>
                                        }
                                        {
                                            (item[0] !== '') &&
                                            <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {{uri: item[0]}}/>
                                        }
                                        </View>
                                        <View style = {{width: deviceWidth * 0.95 - 70 - 5, marginLeft: 5}}>
                                            <View style = {{width: '100%', height: 70}}>
                                                <View style = {{width: '100%', height: '34%', flexDirection: 'row'}}>
                                                    <View style = {{width: '70%', height: '100%'}}>
                                                        <Text style = {[styles.post_username, { marginLeft: 5}]}>{item[6]}</Text>
                                                    </View>
                                                    <View style = {{width: '30%', height: '100%', alignItems: 'flex-end'}}>
                                                        <TouchableOpacity onPress = {() => this.deleteComment(index)}>
                                                            <Text  style = {styles.post_username}>{this.state.selected_language === 0 ? 'Radera' : 'Delete'}</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                                <View style = {{width: '100%', height: '33%'}}>
                                                    <Text style = {[styles.post_username, {marginLeft: 5}]}>{item[7]}</Text>
                                                </View>
                                                <View style = {{width: '100%', height: '33%', alignItems: 'center'}}>
                                                    <Text style = {[styles.post_username, {marginLeft: 5}]}>{item[8]}</Text>
                                                </View>
                                            </View>
                                            <View  style = {{width: '100%', marginTop: 5, borderRadius: 10, backgroundColor: '#0a0f2c', }}>
                                                <Text style = {{fontSize: 15, color: '#ffffff', margin: 10, fontFamily: 'coreSansLight', paddingTop: Platform.OS === 'android' ? 0 : 7}}>{item[1]}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    {
                                        (item[2].length > 0) && 
                                        <View style = {{width: deviceWidth * 0.95 - 70 - 5, height:150, marginLeft: 75, marginTop: 5}}>
                                            <ScrollView style = {{width: '100%', height: '100%'}} horizontal = {true} showsHorizontalScrollIndicator = {false}>
                                                {
                                                    item[2].map((subitem, subindex) => 
                                                    <TouchableOpacity key = {subindex} activeOpacity = {1} onPress = {() => this.clickAttachedImage(subitem, item[3][subindex])}>
                                                        <ImageBackground style = {{height: 150, aspectRatio: item[3][subindex], marginRight: 5, borderRadius: 10, overflow: 'hidden'}} resizeMode = {'contain'} source = {{uri: subitem}}>
                                                        {
                                                            (Global.current_email === item[4])&&
                                                            <TouchableOpacity style = {{right: 5, top: 5, width: 20, height: 20, position: 'absolute'}} onPress = {() => this.deleteCommentImage(index, subindex)}>
                                                                <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/cancel.png')}/>
                                                            </TouchableOpacity>
                                                        }
                                                        </ImageBackground>
                                                    </TouchableOpacity>
                                                    )
                                                }
                                            </ScrollView>
                                        </View>
                                    }
                                </View>
                            )
                        }
                    </ScrollView>
                </View>
                {
                    (this.state.activityType !== '5') && 
                    this.renderCommentBox()
                }
                {/* {
                    (this.state.notification_group_id === Global.group_id) &&
                    <View style = {{width: '100%', height: 0, alignItems: 'center', justifyContent: 'center'}}>
                        <View style = {{width: '95%', height:0, borderTopWidth: 1, borderTopColor: '#bfc1d1'}}></View>
                    </View>
                }
                {
                    (!this.state.editMessage_flag) && (this.state.new_comment_image_urls.length > 0) &&
                    <View style = {this.comment_image_view_style_func()}>
                        <View style = {{width: '95%', height: '100%', borderRadius: 10, backgroundColor: '#0a0f2c', borderWidth: 1, borderColor: '#ffffff', overflow: 'hidden'}}>
                            <ScrollView style = {{width: '100%', height: input_image_height,}} horizontal = {true} showsHorizontalScrollIndicator = {false}>
                            {
                                (this.state.new_comment_image_urls.length > 0) &&
                                this.state.new_comment_image_urls.map((item, index) => 
                                    <View key = {index} style = {{height: input_image_height, aspectRatio: this.state.new_comment_image_ratioArray[index], marginRight: 5, borderRadius: 10, overflow: 'hidden', }}>
                                        <ImageBackground source={{ uri: item }} resizeMode = {'contain'} style={{ width: '100%', height: '100%' }} >
                                            <TouchableOpacity style = {{right: 5, top: 5, width: 20, height: 20, position: 'absolute'}} onPress = {() => this.deleteImageFromNewComment(index)}>
                                                <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/cancel.png')}/>
                                            </TouchableOpacity>
                                        </ImageBackground>
                                    </View>
                                )
                            }
                            </ScrollView>
                        </View>
                    </View>
                }
                {
                    (this.state.notification_group_id === Global.group_id) &&
                    <View style = {this.comment_input_style_func()}>
                        <View style = {{width: '95%', height: Math.max(input_comment_height, this.state.input_comment_change_height), alignItems: 'flex-end', justifyContent: 'center', flexDirection: 'row'}}>
                            <View style = {{width: '85%', height: '100%', borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#5d1b88', flexDirection: 'row'}}>
                                <TextInput 
                                    underlineColorAndroid = 'transparent' 
                                    multiline={true} 
                                    style = {{width: '70%', height: '100%', fontSize: 15, color: '#ffffff', fontFamily: 'coreSansLight', paddingTop: Platform.OS === 'android' ? 0 : 7}} 
                                    onChangeText = {this.handleNewComment} 
                                    onFocus = {() => this.setEditMessageFlag()}
                                    onContentSizeChange = {(event) => {this.setState({input_comment_change_height: event.nativeEvent.contentSize.height})}}>
                                    {this.state.new_comment_message}
                                    </TextInput>
                                <View style = {{width: '25%', height: '100%', alignItems: 'flex-end', justifyContent: 'center', flexDirection: 'row'}}>
                                    <TouchableOpacity style = {{width: deviceHight * 0.04, height: deviceHight * 0.056, alignItems: 'flex-start', justifyContent: 'center', }} onPress = {() => this.addImageFromGallery()}>
                                        <Image style = {{width: '80%', height: '80%'}} resizeMode = {'contain'} source = {require('../assets/images/send_comment_flip.png')}/>
                                    </TouchableOpacity>
                                    <TouchableOpacity style = {{width: deviceHight * 0.04, height: deviceHight * 0.056, alignItems: 'flex-end', justifyContent: 'center'}} onPress = {() => this.addImageFromCamera()}>
                                        <Image style = {{width: '80%', height: '80%'}} resizeMode = {'contain'} source = {require('../assets/images/send_comment_camera.png')}/>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <TouchableOpacity style = {{width: '15%', height: input_comment_height}} onPress = {() => this.sendComment()}>
                                <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/send_comment.png')}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                } */}
                {/* banner view */}
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
        borderRadius: 40,
        overflow: 'hidden'
    },
    title_text: {
        color: '#ffffff',
        fontSize: 20,
        marginTop: 40,
        fontFamily: 'coreSansBold', 
        paddingTop: Platform.OS === 'android' ? 0 : 10
    },
    post_time: {
        color: '#ffffff',
        fontSize: 12,
        fontFamily: 'coreSansBold',
        // paddingTop: Platform.OS === 'android' ? 0 : 7
        // marginTop: 50,
    },
    main_section: {
        width: '100%',
        height: mainSectionHeight - 15,
        // backgroundColor: '#555555',
        marginTop: 50,
        // marginLeft: 10,
        // marginRight: 10,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    post_user_info: {
        width: '100%', 
        height: 70, 
        flexDirection: 'row'
    },
    post_user_picture_view: {
        width: 70, 
        height: 70, 
        borderRadius: 5, 
        overflow: 'hidden',
        // backgroundColor: '#aaaaaa'
    },
    post_user_text_view: {
        width: deviceWidth * 0.9 - 100, 
        height: 70, 
        marginLeft: 10, 
        alignItems: 'center', 
        justifyContent: 'flex-start'
    },
    post_username: {
        width: '100%', 
        // height: '33%', 
        fontSize: 15, 
        color: '#ffffff',
        fontFamily: 'coreSansBold',
        paddingTop: Platform.OS === 'android' ? 0 : 7
    },
    post_address_phone_view: {
        width: '100%', 
        height: '33%', 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'flex-start'
    },
    post_address_phone_icon_view: {
        width: 25, 
        height: 25
    },
    post_address_text_view: {
        height: '100%', 
        alignItems: 'flex-start', 
        justifyContent: 'center', 
        // marginLeft: 7
    },
    addr_num_phone_text: {
        fontSize: 15, 
        color: '#ffffff',
        fontFamily: 'coreSansBold',
        paddingTop: Platform.OS === 'android' ? 0 : 7
    },
    comment_text_view: {
        width: '100%', 
        height: 60, 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'absolute',
    },
    
    banner_section: {
        bottom: 0,
        position:'absolute',
        width: '100%',
        height: deviceHight * 0.1,
        
        backgroundColor: '#392b59',
    },

    
});