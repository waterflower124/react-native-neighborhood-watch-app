import React, {Component} from 'react';
import { StyleSheet, Text, View, Navigator, BackHandler, Alert, SQLite } from 'react-native';

import {SafeAreaView, createStackNavigator, createSwitchNavigator} from 'react-navigation';

import Global, {
    CoreSnasCRLight,
    CoreSnasCRRegular,
    CoreSnasCRBold,
} from './src/Global/Global';

import SplashScreen from './src/pages/SplashScreen';
import SignIn from './src/pages/SignIn';
import CreateProfile from './src/pages/CreateProfile';
import Home from './src/pages/Home';
import CreateNotification from './src/pages/CreateNotification';
import ActivityLog from './src/pages/ActivityLog';
import MyProfile from './src/pages/MyProfile';
import ShowNotification from './src/pages/ShowNotification';
import DisplayingImage from './src/pages/DisplayingImage';
import TermsAndConditions from './src/pages/TermsAndConditions';
import PrivacyAndPolicy from './src/pages/PrivacyAndPolicy';
import GetGroupID from './src/pages/GetGroupID';
import ForgotPassword from './src/pages/ForgotPassword';
import AdministrateUsers from './src/pages/AdministrateUsers';

const Navigation = createStackNavigator(
    {
        // SplashScreen: {screen: SplashScreen, header: null},
        SignIn: {screen: SignIn},
        CreateProfile: {screen: CreateProfile}, 
        Home: {screen: Home},
        CreateNotification: {screen: CreateNotification},
        ActivityLog: {screen: ActivityLog},
        MyProfile: {screen: MyProfile},
        ShowNotification: {screen: ShowNotification},
        DisplayingImage: {screen: DisplayingImage},
        TermsAndConditions: {screen: TermsAndConditions},
        PrivacyAndPolicy: {screen: PrivacyAndPolicy},
        GetGroupID: {screen: GetGroupID},
        ForgotPassword: {screen: ForgotPassword},
        AdministrateUsers: {screen: AdministrateUsers},
    }
)

// const dBase = SQLite.openDatabase('dBase.db');
// const dBaseLanguage = SQLite.openDatabase('dBaselanguage.db');
// const dBaseAlarm = SQLite.openDatabase('dBasealarm4.db');

// export default Navigation;
function getActiveRouteName(navigationState) {
    if (!navigationState) {
      return null;
    }
    const route = navigationState.routes[navigationState.index];
    // dive into nested navigators
    if (route.routes) {
      return getActiveRouteName(route);
    }
    return route.routeName;
  } 
export default class App extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            selected_language: 0
        }
    }

    componentDidMount() {
        this.backButtonListener = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        
    };

    setLanguage = (item) => {
		// console.log(item);
		if(item.length > 0) {
			var lang = parseInt(item[0].language, 10);
            this.setState({selected_language: lang});
		} 
	};

    handleBackButton = () => {
            if(Global.language === 0) {
                const self = this;
                Alert.alert('Observera!', 'Vill du verkligen lämna appen?',
                    [
                        {text: 'Avbryt', onPress: null},
                        {text: 'Ok', onPress: () => BackHandler.exitApp()}
                    ],
                    { cancelable: true }
                );
            } else {
                const self = this;
                Alert.alert('Notice!', 'Do you really want to exit?',
                    [
                        {text: 'Cancel', onPress: null},
                        {text: 'Ok', onPress: () => BackHandler.exitApp()}
                    ],
                    { cancelable: true }
                );
            };
            return true;
    };
    render() {
        return(
            <Navigation
                onNavigationStateChange={(prevState, currentState) => {
                    const currentScreen = getActiveRouteName(currentState);
                    Global.currentScreen = currentScreen;
                    if(currentScreen !== 'Home') {
                        this.backButtonListener.remove();
                    } else {
                        this.backButtonListener = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
                    }
                    // console.log(Global.currentScreen);
                }}
            />
        )
    }
};
