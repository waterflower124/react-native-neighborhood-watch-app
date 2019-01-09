import React, {Component} from 'react';
import { StyleSheet, Text, View, Navigator,
	Image,
	ImageBackground,
	StatusBar,
	Alert,
 } from 'react-native';
import Global from '../Global/Global';

import { ImagePicker, Permissions, SQLite, Notifications } from 'expo';
import Expo from 'expo';
import { BallIndicator } from 'react-native-indicators';

const dBase = SQLite.openDatabase('dBase.db');
const dBaseLanguage = SQLite.openDatabase('dBaselanguage.db');
const dBaseAlarm = SQLite.openDatabase('dBasealarm.db');

export default class SplashScreen extends Component {
	static navigationOptions = {
		header: null,
	};

	constructor(){
		super();

		this.state={
		  isVisible : true,
		  showIndicator: false,
		}
	}


	 Hide_Splash_Screen = () => {

		this.setState({showIndicator: true});
		self = this;
		dBaseLanguage.transaction(tx => {
			tx.executeSql(
				`select * from items where 1`,
				null,
				(_, { rows: { _array } }) => self.setLanguage(_array),
			);
		});

		dBase.transaction(tx => {
			tx.executeSql(
				`select * from items where 1`,
				null,
				(_, { rows: { _array } }) => self.processdBaseData(_array),
			);
		});
		dBaseAlarm.transaction(tx => {
			tx.executeSql(
				`select * from items where 1`,
				null,
				(_, { rows: { _array } }) => self.setAlarmAction(_array),
			);
		});
	}

	setLanguage = (item) => {
		// console.log(item);
		if(item.length > 0) {
			var lang = parseInt(item[0].language, 10);
			Global.language = lang;
		}
	};

	setAlarmAction = (item) => {
		if(item.length > 0) {
			var alarm = parseInt(item[0].alarm_action, 10);
			Global.alarm_action = alarm;
		}
	}

	processdBaseData = async(item) => {
		// console.log(item);
		if(item.length > 0) {
			var email = item[0].email;
			var password = item[0].password;
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
					
					// self.setState({showIndicator: false});
					self.setState({
						isVisible : false,
						showIndicator: false
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
						
						self.props.navigation.navigate('Home');
					}
					
				})
				.catch(function(error) {
					self.setState({isVisible : false, showIndicator: false});
					self.props.navigation.navigate('SignIn');
					Alert.alert('Warning!', 'Network error.');
				})

			
		} else {
			this.setState({
				isVisible : false,
				showIndicator: false
			});
			this.props.navigation.navigate('SignIn');
		}
	}

	getExpoNotificationToken = async() => {
		// Remote notifications do not work in simulators, only on device
		if (!Expo.Constants.isDevice) {
		  return;
		}
		let { status: existingStatus } = await Permissions.getAsync(
		  Permissions.NOTIFICATIONS,
		);
		let finalStatus = existingStatus;

		if (existingStatus !== 'granted') {
			const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
			finalStatus = status;
		}

		if (finalStatus !== 'granted') {
			console.log('eeeee');
			alert("errrrrrrrrr");
		  return;
		}
		try {
			let value = await Notifications.getExpoPushTokenAsync();
			console.log('Our token', value);
			Global.notification_token = value;
			alert(value);
			// // /// Send this to a server
			// alert('00000000');
		} catch (error) {
			alert(error);
		}
	}

	handleNotification = ({ origin, data }) => {
		console.log(
		  `Push notification ${origin} with data: ${JSON.stringify(data)}`,
		);
		// this.props.navigation.navigate('SignIn');
	};

	async componentWillMount() {
		Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT);

		dBase.transaction(tx => {
			tx.executeSql(
				'create table if not exists items (id integer primary key not null, email text, password text);'
			);
		});
		dBaseLanguage.transaction(tx => {
			tx.executeSql(
				'create table if not exists items (id integer primary key not null, language integer);'
			);
		});
		dBaseAlarm.transaction(tx => {
			tx.executeSql(
				'create table if not exists items (id integer primary key not null, alarm_action integer);'
			);
		});

		//register expo notification
		this.getExpoNotificationToken();
		this.listener = Notifications.addListener(this.handleNotification);
		
		// this.getCountriesJsonData();
		var that = this;
		
		setTimeout(function(){
			that.Hide_Splash_Screen();
		}, 2000);

		// await this.getLanguagesJsonData();

		const result3 = await Permissions.askAsync(Permissions.CAMERA);
        const result2 = await Permissions.askAsync(Permissions.CAMERA_ROLL);

		// Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT);
		// StatusBar.setHidden(true);

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
                    Alert.alert("Warnning!", data.message);
                } else if(data.status === 'success'){
                    // let countriesData = data.countries;
                    // for(i = 0; i < countriesData.length; i ++) {
                    //     Global.countries.push(countriesData[i].name);
                    //     // console.log(countriesData[i].name);
					// }
					Global.countries = data.countries;
                }
                
            })
            .catch(function(error) {
				console.log('Network error countryyyyyy');
                Alert.alert('Warnning!', 'Network error.');
            })
		}
		

	};

	render() {

		let Splash_Screen = (
			// <ImageBackground style = {{width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center'}} resizeMode = 'cover' source = {require('../assets/images/splash_background.jpg')}>
			// 	<Image style = {styles.logostyle} resizeMode = {'contain'} source = {require('../assets/images/splash_logo.png')}/>
			// </ImageBackground>
			<View style = {{width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
				<Image style = {styles.logostyle} resizeMode = {'contain'} source = {require('../assets/images/splash_logo.png')}/>
			</View>
	    );

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
				{
		          (this.state.isVisible === true) ? Splash_Screen : null
		        }
				
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
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
});