
import React, {Component} from 'react';
import { StyleSheet, Text, View, Navigator,
	ImageBackground,
	// Image,
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
 } from 'react-native';

import {Font, Constants} from 'expo';
import { ImagePicker, Permissions } from 'expo';

import {
    CoreSnasCRLight,
    CoreSnasCRRegular,
    CoreSnasCRBold,
} from '../Global/Global'

import Global from '../Global/Global';

import Image from 'react-native-scalable-image';


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

            keyboardHeight: 0,

            activityType: 'Fire and Smoke',
            post_user_id: 0,////// DB index for this post user
            post_time: 'Sep 02 - 4: 02 pm',
            post_username: 'Patrick Cox',
            post_street_address: '459 Clinton Lane Bartlett',
            post_street_number: 'II. 60103',
            post_phonenumber: '202-555-0133',
            post_message: "Lorem lpsum is simply dummy text of the printing and typesetting industry. Lorem lpsum is simply dummy text Lorem lpsum is simply dummy text of the printing and typesetting industry. Lorem lpsum is simply dummy text of the printing and typesetting industry. Lorem lpsum has beed the industy's standard dummy text over since the 1500s, when an unknown printor took a gallery of they and ...",
            post_images: [['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTk0ZS-mzIXylbTyBx7tlfIIhmEoakDPtgPtp0K_JK2KZe4zozi', 0, 0],
                ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIsk5nWVjXsgQERUeDE9qUoyeJvdEJOiyAx65qKNWghOyU-1gYrA', 0, 0],
                ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_IriZ3USxNaRDvvQZ17gZhNuaYiSQMprOgCZpFvYRjx7uVvmD', 0, 0]],

            db_index: this.props.navigation.state.params.db_index,//db index for the current selected activity

            comment_array: [['comment_post_user1_image_url', 'Lorem lpsum is simply dummy text of the printing and typesetting industry. Lorem lpsum has beed the industys standard dummy text over since the 1500s, when an unknown printor took a gallery of they and ...', ['comment containt image1 url', 'comment containt image2 url']], 
                ['comment_post_user2_image_url', 'Lorem lpsum is simply dummy text of the printing and typesetting industry. Lorem lpsum has beed the industy', []],
                ['comment_post_user3_image_url', 'comment text', ['comment containt image1 url', 'comment containt image2 url', 'comment containt image3 url']]],

            editMessage_flag: false,///if edit true, else false that is only view

            input_comment_change_height: 0,////bottom input box height

            new_comment_message: '',
            new_comment_image_urls: [],

            showFullImageFlag: false,//// use for user click attached image so show full size image


        };
    };

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

        
/////////////////////////////////////
        // fetch data from server
////////////////////////////
        // self = this;
        // for (i = 0; i < this.state.post_images.length; i ++) {
        //     Image.getSize(this.state.post_images[i][0], (width, height) => {
        //         self.setState({post_images[i][1]: width});
        //     }, (error) => {
        //         console.log("error");
        //     });
        // }
        
        
    };

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

    post_activity_image_view_style = async (image_uri) => {
        var view_height = 0;
        await Image.getSize(image_uri, (width, height) => {
            // view_height = height;
            var view_height = deviceWidth / width * height;
            return {
                width: '100%', 
                height: view_height, 
                borderRadius: 10, 
                overflow: 'hidden', 
                marginBottom: 10, 
                backgroundColor: '#888888',
                marginBottom: 10,
                borderRadius: 10,
            }
        }, (error) => {
            console.log("error");
        });

        // alert(view_height);
        
    }

    componentDidMount() {
        Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
    };

    _keyboardDidShow(e) {
        this.setState({keyboardHeight: e.endCoordinates.height});
    }
    
    _keyboardDidHide(e) { 
         this.setState({keyboardHeight: 0});
    }

    initNotificationState = (db_index) => {
        alert(db_index + ':    4444444');
    };

    goActivityLogpage = () => {
        this.props.navigation.navigate('ActivityLog', {initNotificationState: this.initNotificationState.bind(this)});
        // alert("5555555");
    };

    editMessage = () => {
        this.setState({editMessage_flag: !this.state.editMessage_flag});
        this.setState({new_comment_message: '', new_comment_image_urls: []});
        Keyboard.dismiss();
    };

    saveMessage = () => {
        Keyboard.dismiss();
        this.setState({editMessage_flag: !this.state.editMessage_flag});
        // alert(this.state.post_message);
    };

    handleMessageContents = (typedText) => {
        this.setState({post_message: typedText});
    };

    clickAttachedImage = (image_uri) => {
        // this.setState({showFullImageFlag: true});
        this.props.navigation.navigate({key: 'DisplayingImage', routeName: 'DisplayingImage', params:{selectedImage: image_uri}});
        
    };

    handleNewComment = (typedText) => {
        this.setState({new_comment_message: typedText});
    }

    addImageFromGallery = async() => {
        Keyboard.dismiss();
        let result = await Expo.ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            // width: '100%',
            // height: '100%',
            aspect: [1, 1],
        });
      
        // console.log(result);
    
        if (!result.cancelled) {
            this.setState({ new_comment_image_urls: [...this.state.new_comment_image_urls, result.uri] });
        }
    };

    addImageFromCamera = async() => {
        Keyboard.dismiss();
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            // width: '100%',
            // height: '100%',
            aspect: [1, 1],
        });
      
        // console.log(result);
    
        if (!result.cancelled) {
            this.setState({ new_comment_image_urls: [...this.state.new_comment_image_urls, result.uri] });
        }
    };

    setEditMessageFlag = () => {
        if((Global.user_id == this.state.post_user_id)) {
            if(this.state.editMessage_flag) {
                this.setState({editMessage_flag: false});
            }
        }
    };

    sendComment = () => {
        Keyboard.dismiss();


        this.setState({new_comment_message: ''});
        this.setState({new_comment_image_urls: []});

    };

    deleteImageFromNewComment = (delete_image_index) => {
        // this.setState({new_comment_image_urls: this.state.new_comment_image_urls.filter(function(new_image_urls) {
        //     return new_image_urls !== delete_image.target.value
        // })})

        var array = [...this.state.new_comment_image_urls];
        array.splice(delete_image_index, 1);
        this.setState({new_comment_image_urls: array});

        // alert(delete_image);
    }

    
    render() {
        if (!this.state.isReady) {
            return <Expo.AppLoading/>;
        }
        return (
            <View style={styles.container}>
             {/* {
                (this.state.showFullImageFlag) &&
                <View style = {{width: '100%', height: '100%', position: 'absolute', zIndex: 100, backgroundColor: '#ffffff'}} >
                    <View style = {{width: '100%', height: '10%', flexDirection: 'row'}}>
                        <View>
                        </View>
                    </View>
                    <ImageBackground style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/splash_background.jpg')}>

                    </ImageBackground>
                </View>
            } */}
                <TouchableOpacity style = {styles.back_button_view} onPress = {() => this.goActivityLogpage()}>
                    <View style = {{width: 12, height: '100%'}}>
                        <Image style = {{width: '100%', height: '100%'}} resizeMode = 'contain' source = {require('../assets/images/left_arrow.png')}/>
                    </View>
                    <View style = {{width: '70%', height: '100%', justifyContent: 'center', marginLeft: 5}}>
                        <Text style = {{fontSize: 12, color: '#ffffff', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}> Activity </Text>
                    </View>
                </TouchableOpacity>
                <View style = {styles.top_section}>
                    <ImageBackground style = {{width: '100%', height: '100%', alignItems: 'center'}} resizeMode = {'stretch'} source = {require('../assets/images/top_head.png')}>
                        <Text style = {styles.title_text}> {this.state.activityType} </Text>
                        <Text style = {styles.post_time}> {this.state.post_time} </Text>
                    </ImageBackground>
                </View>
                <View style = {styles.marker_view}>
                {
                    (this.state.activityType == 'Burglary') &&
                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {require('../assets/images/activitylog_burglary.png')}/>
                }
                {
                    (this.state.activityType == 'Fire and Smoke') &&
                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {require('../assets/images/activitylog_fire.png')}/>
                }
                {
                    (this.state.activityType == 'Suspicious') &&
                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {require('../assets/images/activitylog_suspicious.png')}/>
                }
                {
                    (this.state.activityType == 'Need Immediate Help') &&
                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {require('../assets/images/activitylog_help112.png')}/>
                }
                </View>
                <View style = {styles.main_section}>
                    <ScrollView showsVerticalScrollIndicator = {false} style = {{width: '95%'}}>
                        <View style = {styles.post_user_info}>
                            <View style = {styles.post_user_picture_view}>
                                <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {require('../assets/images/top_head.png')}/>
                            </View>
                            <View style = {styles.post_user_text_view}>
                                <Text style = {styles.post_username}>{this.state.post_username}</Text>
                                <View style = {styles.post_address_phone_view}>
                                    <View style = {styles.post_address_phone_icon_view}>
                                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/white_address.png')}/>
                                    </View>
                                    <View style = {styles.post_address_text_view}>
                                        <Text style = {styles.addr_num_phone_text}>{this.state.post_street_address}</Text>
                                        <Text style = {styles.addr_num_phone_text}>{this.state.post_street_number}</Text>
                                    </View>
                                </View>
                                <View style = {styles.post_address_phone_view}>
                                    <View style = {styles.post_address_phone_icon_view}>
                                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/white_phone.png')}/>
                                    </View>
                                    <View style = {styles.post_address_text_view}>
                                        <Text style = {styles.addr_num_phone_text}>{this.state.post_phonenumber}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style = {{width: '100%', height: 30, flexDirection: 'row', marginTop: 10}}>
                            <View style = {{width: '40%', height: '100%', justifyContent: 'center'}}>
                                <Text style = {{fontSize: 18, color: '#ffffff', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 9}}> Message </Text>
                            </View>
                            {
                                (Global.user_id == this.state.post_user_id)&&
                                <View style = {{width: '60%', height: '100%', justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row'}}>
                                {
                                    (!this.state.editMessage_flag) && 
                                    <TouchableOpacity style = {{width: 30, height: '70%', marginRight: 10}} onPress = {() => this.editMessage()}>
                                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/white_edit.png')}/>
                                    </TouchableOpacity>
                                }
                                    {
                                        (this.state.editMessage_flag) && 
                                        <TouchableOpacity style = {{width: 30, height: '70%', marginRight: 10}} onPress = {() => this.saveMessage()}>
                                            <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/white_save.png')}/>
                                        </TouchableOpacity>
                                    }
                                </View>
                            }
                        </View>
                        <View style = {{width: '100%', height: 80, marginTop: 5}}>
                        {
                            (!this.state.editMessage_flag) && 
                            <ScrollView style = {{width: '100%', height: 60}}>
                                <View style = {{width: '100%'}}>
                                <Text style = {{width: '100%', fontSize: 15, color: '#ffffff', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 7}} multiline = {true}>{this.state.post_message}</Text>
                                </View>
                            </ScrollView>
                        }
                        {
                            (this.state.editMessage_flag) && 
                            <TextInput underlineColorAndroid = 'transparent' style = {{width: '100%', fontSize: 15, color: '#ffffff', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 7}} multiline = {true} onChangeText = {this.handleMessageContents}>{this.state.post_message}</TextInput>
                        }
                        </View>
                        {/* {
                            !(this.state.post_images.length == 0) &&
                            <View style = {{width: '100%', height: 200, marginTop: 10}}>
                                <ScrollView style = {{width: '100%', height: '100%'}} horizontal = {true} showsHorizontalScrollIndicator = {false}>
                                    {
                                        this.state.post_images.map((item, index) => 
                                            <View key = {index} style = {{width: 200, height: 200, borderRadius: 10, overflow: 'hidden', marginRight: 10}}>
                                                <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {require('../assets/images/top_head.png')}/>
                                            </View>
                                        )
                                    }
                                </ScrollView>
                            </View>
                        } */}
                        {
                            !(this.state.post_images.length == 0) &&
                            <View style = {{width: '100%', height: 200, marginTop: 10}}>
                                <ScrollView style = {{width: '100%', height: '100%'}} showsVerticalScrollIndicator = {false}>
                                    {
                                        this.state.post_images.map((item, index) => 
                                            <TouchableOpacity key = {index} style = {{width: '100%', borderRadius: 10, overflow: 'hidden', marginBottom: 10, marginBottom: 10, borderRadius: 10,}} onPress = {() => this.clickAttachedImage(Math.random())}>
                                                <Image key = {index} style = {{width: '100%'}} resizeMode = {'cover'} source = {{uri: item[0]}}/>
                                            </TouchableOpacity>
                                        )
                                    }
                                </ScrollView>
                            </View>
                        }
                        {/* <View style = {{width: '100%', alignItems: 'center'}}> */}
                        {
                            (this.state.comment_array.length > 0) &&
                            this.state.comment_array.map((item, index) => 
                                <View key = {index} style = {{width: '100%'}}>
                                    <View style = {{width: '100%', marginTop: 10, flexDirection: 'row'}}>
                                        <View style = {{width: 70, height: 70, borderRadius: 10, overflow: 'hidden'}}>
                                            <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {require('../assets/images/top_head.png')}/>
                                        </View>
                                        <View style = {{width: deviceWidth * 0.95 - 70 - 5, marginLeft:5, borderRadius: 10, backgroundColor: '#0a0f2c', }}>
                                            <Text style = {{fontSize: 15, color: '#ffffff', margin: 10, fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 7}}>{item[1]}</Text>
                                        </View>
                                    </View>
                                    {
                                        (item[2].length > 0) && 
                                        <View style = {{width: deviceWidth * 0.95 - 70 - 5, height:150, marginLeft: 75, marginTop: 5}}>
                                            <ScrollView style = {{width: '100%', height: '100%'}} horizontal = {true} showsHorizontalScrollIndicator = {false}>
                                                {
                                                    item[2].map((subitem, subindex) => 
                                                        <View key = {subindex} style = {{width: 150, height:150, marginRight: 5, borderRadius: 10, overflow: 'hidden'}}>
                                                            <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {require('../assets/images/top_head.png')}/>
                                                        </View>
                                                    )
                                                }
                                            </ScrollView>
                                        </View>
                                    }
                                </View>
                            )
                        }
                        {/* </View> */}
                    </ScrollView>
                </View>
                {/* seperate line */}
                <View style = {{width: '100%', height: 0, alignItems: 'center', justifyContent: 'center'}}>
                    <View style = {{width: '95%', height:0, borderTopWidth: 1, borderTopColor: '#bfc1d1'}}></View>
                </View>
                    {
                        (!this.state.editMessage_flag) && (this.state.new_comment_image_urls.length > 0) &&
                        // <View style = {{width: '100%', height: 100, alignItems: 'center', justifyContent: 'center', bottom: this.state.keyboardHeight + Math.max(input_comment_height, this.state.input_comment_change_height), position: 'absolute'}}>
                        <View style = {this.comment_image_view_style_func()}>
                            <View style = {{width: '95%', height: '100%', borderRadius: 10, backgroundColor: '#0a0f2c', borderWidth: 1, borderColor: '#ffffff', overflow: 'hidden'}}>
                                <ScrollView style = {{width: '100%', height: input_image_height,}} horizontal = {true} showsHorizontalScrollIndicator = {false}>
                                {
                                    (this.state.new_comment_image_urls.length > 0) &&
                                    this.state.new_comment_image_urls.map((item, index) => 
                                    // <View style = {{width: input_image_height, height: input_image_height, alignItems: 'center', justifyContent: 'center'}}>
                                        <View key = {index} style = {{width:input_image_height, height: input_image_height, marginRight: 5, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#ffffff'}}>
                                            <ImageBackground source={{ uri: item }} resizeMode = {'contain'} style={{ width: '100%', height: '100%' }} >
                                                <TouchableOpacity style = {{left: input_image_height - 20 - 5, top: 5, width: 20, height: 20}} onPress = {() => this.deleteImageFromNewComment(index)}>
                                                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/cancel.png')}/>
                                                </TouchableOpacity>
                                            </ImageBackground>
                                        </View>
                                    // </View>
                                    )
                                }
                                </ScrollView>
                            </View>
                        </View>
                    }
                    {/* <View style = {((this.state.keyboardHeight == 0) && (!this.state.editMessage_flag)) ? [styles.comment_text_view, {bottom: deviceHight * 0.1,}] : [styles.comment_text_view, {bottom: this.state.keyboardHeight,}]}> */}
                    <View style = {this.comment_input_style_func()}>
                        <View style = {{width: '95%', height: Math.max(input_comment_height, this.state.input_comment_change_height), alignItems: 'flex-end', justifyContent: 'center', flexDirection: 'row'}}>
                            <View style = {{width: '85%', height: '100%', borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#5d1b88', flexDirection: 'row'}}>
                                <TextInput 
                                    underlineColorAndroid = 'transparent' 
                                    multiline={true} 
                                    style = {{width: '70%', height: '100%', fontSize: 20, color: '#ffffff', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 10}} 
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

                {/* banner view */}
                <View style = {styles.banner_section}>
                </View>
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
        left: 5,
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
        overflow: 'hidden'
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
        marginTop: 35,
        fontFamily: 'coreSansBold', 
        // paddingTop: Platform.OS === 'android' ? 0 : 10
    },
    post_time: {
        color: '#ffffff',
        fontSize: 15,
        fontFamily: 'coreSansBold',
        // paddingTop: Platform.OS === 'android' ? 0 : 7
        // marginTop: 50,
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
    post_user_info: {
        width: '100%', 
        height: 90, 
        flexDirection: 'row'
    },
    post_user_picture_view: {
        width: 90, 
        height: 90, 
        borderRadius: 5, 
        overflow: 'hidden'
    },
    post_user_text_view: {
        width: deviceWidth * 0.9 - 100, 
        height: 90, 
        marginLeft: 10, 
        alignItems: 'center', 
        justifyContent: 'flex-start'
    },
    post_username: {
        width: '100%', 
        height: '33%', 
        fontSize: 18, 
        color: '#ffffff',
        fontFamily: 'coreSansBold'
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
        marginLeft: 7
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
        
        backgroundColor: '#666665',
    },

    
});