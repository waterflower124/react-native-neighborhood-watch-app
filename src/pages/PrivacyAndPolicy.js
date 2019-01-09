
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
    Linking,
 } from 'react-native';

import {Font, Constants} from 'expo';
import Communications from '../components/communication/AKCommunications';
import OneSignal from 'react-native-onesignal'; // Import package from node modules

import Global, {
    CoreSnasCRLight,
    CoreSnasCRRegular,
    CoreSnasCRBold,
    CoreSnasCRRegularItalic
} from '../Global/Global'

// import Global from '../Global';

var deviceWidth = Dimensions.get('window').width;
var deviceHight = Dimensions.get('window').height;
var bannerHeight = deviceHight * 0.1;
var topSectionHeight = 120;
var mainSectionHeight = deviceHight - (topSectionHeight + bannerHeight + 40);

export default class PrivacyAndPolicy extends Component {
	static navigationOptions = {
		header: null,
	};

	constructor(props) {
        super(props);
        
        this.state = {
            isReady: false,

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
                // console.log(data);
                if(data.status === 'fail') {
                    // Alert.alert('Warning!', 'There is something wrong')
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
        // BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
        // this.backButtonListener.remove();
        this.props.navigation.addListener('willFocus', this.initLanguage.bind(this));
    }

    async componentWillMount() {

        await Expo.Font.loadAsync({
            coreSansLight: CoreSnasCRLight,
            coreSansRegular: CoreSnasCRRegular,
            coreSansBold: CoreSnasCRBold,
            coreSansRegularItalic: CoreSnasCRRegularItalic,
        });
        this.setState({isReady: true});

		// BackHandler.addEventListener('hardwareBackPress', () => {return true});
		// Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT);
        // StatusBar.setHidden(true);

        // alert(deviceHight + " " + mainSectionHeight + " " + topSectionHeight + " " + bannerHeight);
        
    };

    goMyprofile = () => {
        this.setState({ads_image: ''});
        this.props.navigation.navigate('MyProfile');
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
                            Alert.alert('Warning!', 'Can not open this Ads.');
                        } else if(self.state.selected_language === 0) {
                            Alert.alert('Varning!', 'Annonsen kan inte öppnas.');
                        }
                    }
                });
            })
            .catch(function(error) {
                if(self.state.selected_language === 1) {
                    Alert.alert('Warning!', 'Network error.');
                } else if(self.state.selected_language === 0) {
                    Alert.alert('Varning!', 'Nätverksproblem.');
                }
            })
    }

        
    render() {
        if (!this.state.isReady) {
            return <Expo.AppLoading/>;
        }
        return (
            <View style={styles.container}>
                <TouchableOpacity style = {styles.back_button_view} onPress = {() => this.goMyprofile()}>
                    <View style = {{width: 12, height: '100%'}}>
                        <Image style = {{width: '100%', height: '100%'}} resizeMode = 'contain' source = {require('../assets/images/left_arrow.png')}/>
                    </View>
                    {/* <View style = {{width: '70%', height: '100%', justifyContent: 'center', marginLeft: 5}}>
                        <Text style = {{fontSize: 12, color: '#ffffff', fontFamily: 'coreSansBold', paddingTop: Platform.OS === 'android' ? 0 : 6}}>{this.state.selected_language === 0 ? 'Min profil' : 'My Profile'}</Text>
                    </View> */}
                </TouchableOpacity>
                <View style = {styles.top_section}>
                    {/* <ImageBackground style = {{width: '100%', height: '100%', alignItems: 'center'}} resizeMode = {'stretch'} source = {require('../assets/images/top_head.png')}> */}
                        {/* <View style = {styles.logo_view}>
                            <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/home_logo.png')}/>
                        </View> */}
                        <Text style = {styles.title_text}>{this.state.selected_language === 0 ? 'Integritetspolicy' : 'Privacy And Policy'}</Text>
                    {/* </ImageBackground> */}
                </View>
                <View style = {styles.marker_view}>
                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {require('../assets/images/logo_blue.png')}/>
                </View>
                <View style = {styles.main_section}>
                    <View style = {{width: '95%', height: '95%', backgroundColor: '#0a0f2c', borderRadius: 10}}>
                        <ScrollView style = {{width: '100%', height: '100%'}}>
                            <View style = {{width: '100%', alignItems: 'center'}}>
                            {
                                (this.state.selected_language === 1) &&
                                <View style = {{width: '95%', }}>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                        Generally
                                    </Text>
                                    <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        Safety Zone i Sverige AB also with the term (Safety Zone) respects your privacy and the right to
                                        control your personal information. For us, it is a matter of course to protect your privacy and to
                                        protect your personal data in accordance with applicable laws and regulations.
                                        The Safety Zone Privacy Policy describes what information we collect and why we collect
                                        information from our customers, partners, suppliers and other stakeholders.
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                        Handling of your personal information
                                    </Text>
                                    <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        In order to offer you our services, we need to process your personal information. We protect
                                        your privacy and do not collect more information than we need. We never sell the data to third
                                        parties.
                                        It is important that you read and understand our privacy policy before ordering or using our
                                        services. This policy also includes the handling of personal data in connection with recruitment.
                                        Do you have any questions about our privacy policy? If you want to remove from our register,
                                        you can always contact us at info@safety-zone.se.
                                    </Text>
                                    <Text style = {[{marginTop: 10, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        By ordering or using Safety Zone's services, you accept our privacy policy and our processing of
                                        your personal information. You also agree that the Safety Zone uses electronic communication
                                        channels to communicate and send information to you. Processing of personal data includes all
                                        handling of personal data, for example; collection, registration, analysis, processing, storage
                                        and deletion.
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                        Data gathering
                                    </Text>
                                    <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        This privacy policy covers all data we collect, for example from websites, social media, phone or
                                        email and events / fairs. We may combine personal data collected in a way (such as a website)
                                        with personal data collected in another way (eg on courses).
                                    </Text>
                                    <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        Personal and contact information - Name, Address Information, Email Address, Mobile Phone Number, Your Occupational Role, Your Workplace.
                                    </Text>
                                    <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        Payment Information - Billing Address, Reference, Other Billing Information.
                                    </Text>
                                    <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        Information we collect about you
                                    </Text>
                                    <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        When you come into contact with us, we can collect information (note that we do not necessarily collect all data below):
                                    </Text>
                                    <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        Personal and contact information - name, invoice and delivery address, e-mail address, mobile phone number, your professional role, your workplace.
                                    </Text>
                                    <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        Information about services and deliveries - Details about the services you subscribe to or
                                        purchase, such as current consulting, assignments, projects, or training and newsletters that
                                        you are reading.
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                        Information you provide to us
                                    </Text>
                                    <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        You can directly or indirectly provide us with information about yourself and your company in a
                                        number of ways, such as when you order our services or contact us on our website, when you
                                        contact us by email, letter or phone, or interact on our social media. This information may be:
                                    </Text>
                                    <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        Historical Information - Past Purchase, Event Participation and Payment History.
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                        Use of data
                                    </Text>
                                    <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        The information you provide us is required either to enter into a contractual relationship with us
                                        or for other purposes. For example, it may be that we can improve our information and services
                                        to you or perform our assignments and our commitments to you as a customer. Personal
                                        numbers are only treated in exceptional cases for special services that require legitimate
                                        identity. Also read more about how we use cookies below.
                                    </Text>
                                    <Text style = {[{marginTop: 10, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        Safety Zone processes personal data mainly for the purposes set out below and for any further purpose specified at collection time.
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                        Purpose:
                                    </Text>
                                    <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        To build business relationships and create new ones.
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                        Treatment:
                                    </Text>
                                    <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        - Communication between the Safety Zone and you
                                    </Text>
                                    <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        - Collection of contact details
                                    </Text>
                                    <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        - Out of market communication and PR
                                    </Text>
                                    <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        - Invitations
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                        Personal information:
                                    </Text>
                                    <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        - First and last name
                                    </Text>
                                    <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        - Address
                                    </Text>
                                    <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        - E-mail address
                                    </Text>
                                    <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        - Phone number
                                    </Text>
                                    <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        - Correspondence between you and Safety Zone
                                    </Text>
                                    <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        - What information that is desired or not
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansRegularItalic'}, styles.contents_text]}>
                                        Legal basis for treatment: Legitimate interest. Necessary for Safety Zone to build on existing business relationships and create new ones.
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                        Personal data for marketing purposes:
                                    </Text>
                                    <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        In order to provide direct marketing on Safety Zone offers and knowledge to both existing and
                                        potential customers, the Safety Zone may process personal data regarding customers and
                                        potential clients' representatives. This is especially relevant for marketing
                                        and implementation of events, workshops, seminars and programs. The legal basis for this
                                        treatment is a balance of interest to meet the Safety Zone legitimate interest in informing and
                                        offering a variety of marketing activities for a limited target audience for a limited time and to a
                                        limited extent. If the volunteers have submitted their personal data for a particular purpose and
                                        have been informed of the treatment in connection with the treatment, the registrant is deemed
                                        to have consented to the treatment. If the registrant has provided written consent, the consent
                                        constitutes the legal basis for such treatment. The registrant is entitled to oppose this treatment
                                        at any time.
                                        The information that may be processed is the name, address, telephone number and e-mail
                                        addresses of the workplace as well as any information about departmental title and position.
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                        About cookies
                                    </Text>
                                    <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        When you visit our website, so-called cookies (cookies) are stored on your computer. There are
                                        small text files with information used to identify your computer, customize the content we show
                                        and thus improve your user experience. Information is stored about your use and the pages
                                        visited. This could be technical information about your device and internet connection such as
                                        operating system, browser version, IP address, and unique identifier. When visiting our
                                        websites, different techniques can be used to recognize you in order to learn more about our
                                        users. This can be done directly or through the use of third party technology.
                                        If you do not want to receive cookies, you can block all cookies, delete current cookies from
                                        your computer, or set up to alert you every time a cookie is saved.
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                        Will we share your information?
                                    </Text>
                                    <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        We will never sell your personal information to third parties without your permission. Sometimes
                                        we share your personal information with suppliers or subcontractors in order to perform our
                                        commitments to you. We comply with legal, technical and organizational requirements to ensure
                                        that your information is handled securely.
                                        If the Safety Zone or a substantial part of Safety Zone's assets are acquired by a third party,
                                        personal information about Safety Zone customers may be forwarded to the third party in order
                                        for the mission to be continued.
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                        Where do we process your personal information?
                                    </Text>
                                    <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        We strive to always store your personal data within the EU / EEA. However, in some situations,
                                        they may be treated outside the EU / EEA by a third party, such as a technology provider or
                                        subcontractor. We will always take reasonable legal, technical and organizational measures to
                                        manage your information at the same level as the protection offered within the EU / EEA.
                                        How long do we save your personal information?
                                        We save data as long as it is necessary to meet the purpose for which the information was
                                        collected, or to fulfill our commitments and as long as required by statutory storage times,
                                        especially as regards accounting requirements.
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                        Security
                                    </Text>
                                    <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        Safety Zone's starting point when processing personal data is that it is only those persons in our
                                        business where there is a work-related need for the particular personal data that has access.
                                        Safety Zone has implemented security measures to protect your personal data against
                                        unauthorized or unauthorized treatment. These safety routines are constantly changing as
                                        technology progresses. We use IT systems to protect the privacy, privacy and access to
                                        personal data.
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                        Your rights
                                    </Text>
                                    <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        You as registered with us have multiple rights that you should know. You are entitled to request
                                        a registry exemption, once a year. You are entitled to have your personal information corrected
                                        if they are incorrect, incomplete or misleading and may limit the processing of personal data
                                        until they are changed.
                                        You have the right to be forgotten, but deletion of personal data can not be made if it is required
                                        to fulfill the agreement or other Swedish or European law, court or government decision states
                                        otherwise, and if it is based on legitimate interest. Should you think there are no legitimate
                                        reasons or the legitimate interest is incorrect, you may object to the treatment.
                                        You also have the right to withdraw a consent, make complaints about the processing to the
                                        Data Inspectorate and object to direct marketing.
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                        Change of data protection policy
                                    </Text>
                                    <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        We may update this privacy policy. We will announce changes at www.safety-zone.com and
                                        also disclose the changes we made in the privacy policy. You can always contact us if you want
                                        access to earlier versions.
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                        Contact Us
                                    </Text>
                                    <Text style = {[{marginBottom: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        For questions regarding privacy and data protection, please contact us at info@safety-zone.se
                                    </Text>
                                </View>
                                }
                                {
                                    (this.state.selected_language === 0) &&
                                    <View style = {{width: '95%', }}>
                                        <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                            Allmänt
                                        </Text>
                                        <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            Safety Zone i Sverige AB även med benämningen (Safety Zone) respekterar din integritet och rätten att
                                            ha kontroll över dina personuppgifter. För oss är det en självklarhet att värna om din integritet och skydda
                                            dina personuppgifter i enlighet med gällande lagar och förordningar.
                                            I Safety Zone:s integritetspolicy beskrivs vilka uppgifter vi samlar in och varför vi samlar in information
                                            från våra kunder, samarbetspartners, leverantörer och andra intressenter.
                                        </Text>
                                        <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                            Hantering av dina personuppgifter
                                        </Text>
                                        <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            För att kunna erbjuda dig våra tjänster behöver vi behandla dina personuppgifter. Vi värnar om din
                                            integritet och samlar inte in fler uppgifter än vi behöver. Vi säljer aldrig uppgifterna vidare till tredje part.
                                            Det är viktigt att du läser och förstår vår integritetspolicy innan du beställer eller använder våra tjänster.
                                            Denna policy omfattar även hanteringen av personuppgifter i samband med rekryteringar. Har du några
                                            frågor om vår integritetspolicy alt. vill ta bort dig från våra register, kan du alltid kontakta oss på
                                            info@safety-zone.se.
                                        </Text>
                                        <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            Genom att beställa eller använda Safety Zone:s tjänster accepterar du vår integritetspolicy och vår
                                            behandling av dina personuppgifter. Du godkänner också att Safety Zone använder elektroniska
                                            kommunikationskanaler för att kommunicera och skicka information till dig. Behandling av personuppgifter
                                            innefattar all hantering av personuppgifter, till exempel; insamling, registrering, analys, bearbetning,
                                            lagring och radering.
                                        </Text>
                                        <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                            Insamling av data
                                        </Text>
                                        <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            Denna integritetspolicy täcker all data som vi samlar in, till exempel från webbplatser, sociala media,
                                            kontakt per telefon eller e-post och på evenemang/mässor. Vi kan komma att kombinera personuppgifter
                                            som samlats in på ett sätt (t.ex. en webbplats) med personuppgifter som har samlats in på ett annat sätt
                                            (t.ex. på kurser).
                                        </Text>
                                        <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            - Person- och kontaktinformation – namn, adressinformation, e-postadress, mobiltelefonnummer, din yrkesroll, din arbetsplats.
                                        </Text>
                                        <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            - Betalningsinformation – fakturaadress, referensperson, annan faktureringsinformation.
                                        </Text>
                                        <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            - Information vi samlar in om dig
                                        </Text>
                                        <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            - När du kommer i kontakt med oss kan vi samla in information om (observera att vi inte alltid nödvändigtvis samlar in all nedannämnd data):
                                        </Text>
                                        <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            - Person- och kontaktinformation – namn, faktura- och leveransadress, e- postadress, mobiltelefonnummer, din yrkesroll, din arbetsplats.
                                        </Text>
                                        <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            - Information om tjänster och leveranser – detaljer angående de tjänster du prenumererar påeller köper, ex löpande konsulttjänster, uppdrag, projekt eller utbildningar och nyhetsbrev som duläser.
                                        </Text>
                                        <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                            Information som du ger till oss
                                        </Text>
                                        <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            Du kan direkt eller indirekt komma att ge oss information om dig själv och ditt företag på ett antal olika
                                            sätt, såsom när du beställer våra tjänster eller kontaktar oss på vår hemsida, när du kontaktar oss per
                                            e-post, brev eller telefon, eller interagerar på våra sociala medier. Denna information kan vara:
                                        </Text>
                                        <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            - Historisk information – tidigare köp, deltagande på event.
                                        </Text>
                                        <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            - betalningshistorik.
                                        </Text>
                                        <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            - Användning av data
                                        </Text>
                                        <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            Informationen du ger oss behövs antingen för att ingå ett avtalsförhållande med oss, eller för andra
                                            syften. Det kan till exempel vara för att vi ska kunna förbättra vår information och tjänster till dig eller
                                            utföra våra uppdrag och våra åtaganden gentemot dig som kund. Personnummer behandlas bara i
                                            undantagsfall för särskilda tjänster som kräver legitimerad identitet. Läs även mer om hur vi använder
                                            cookies nedan.
                                        </Text>
                                        <Text style = {[{marginTop: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            Safety Zone behandlar personuppgifter i huvudsak för de ändamål som anges nedan samt för de
                                            eventuella ytterligare ändamål som anges vid insamlingstidpunkten.
                                            Kontakt med kunder, potentiella kunder och partners/leverantörer
                                        </Text>
                                        <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            - Syfte
                                        </Text>
                                        <Text style = {[{marginLeft: 40, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            För att bygga affärsrelationer och skapa nya.
                                        </Text>
                                        <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            - Behandling
                                        </Text>
                                        <Text style = {[{marginLeft: 40, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            • Kommunikation mellan Safety Zone och dig
                                        </Text>
                                        <Text style = {[{marginLeft: 40, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            • Insamling av kontaktuppgifter
                                        </Text>
                                        <Text style = {[{marginLeft: 40, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            • Utskick av
                                        </Text>
                                        <Text style = {[{marginLeft: 40, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            • marknadskommunikation och
                                        </Text>
                                        <Text style = {[{marginLeft: 40, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            • PR
                                        </Text>
                                        <Text style = {[{marginLeft: 40, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            • Inbjudningar
                                        </Text>
                                        <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            - Personuppgifter
                                        </Text>
                                        <Text style = {[{marginLeft: 40, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            • För- och efternamn
                                        </Text>
                                        <Text style = {[{marginLeft: 40, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            • Yrkestitel och adress
                                        </Text>
                                        <Text style = {[{marginLeft: 40, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            • E-postadress
                                        </Text>
                                        <Text style = {[{marginLeft: 40, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            • Telefonnummer
                                        </Text>
                                        <Text style = {[{marginLeft: 40, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            • Korrespondens mellan dig och Safety Zone
                                        </Text>
                                        <Text style = {[{marginLeft: 40, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            • Vilken typ av information som önskas eller inteönskas
                                        </Text>
                                        <Text style = {[{fontFamily: 'coreSansRegularItalic'}, styles.contents_text]}>
                                            Laglig grund för behandling : Berättigat intresse. Nödvändig för att Safety Zone ska kunna bygga vidare på
                                            befintliga affärsrelationer och skapa nya.
                                        </Text>
                                        <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                            Personuppgifter för marknadsföringsändamål
                                        </Text>
                                        <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            I syfte att tillhandahålla direktmarknadsföring om Safety Zone erbjudanden och kunskap till både
                                            befintliga och potentiella kunder kan Safety Zone komma att behandla personuppgifter avseende kunder
                                            och potentiella kunders företrädare. Detta är framförallt aktuellt vid marknadsföring
                                            och genomförande av event, workshopar, seminarier och utbildningar. Den lagliga grunden för denna
                                            behandling är en intresseavvägning för att tillgodose Safety Zone berättigade intresse av att under en
                                            begränsad tid och i en begränsad omfattning informera om samt erbjuda olika marknadsaktiviteter till en
                                            utvald målgrupp. Om de registrerade på frivillig väg har lämnat sina personuppgifter för ett visst ändamål
                                            och i samband därmed har informerats om behandlingen anses den registrerade har samtyckt till
                                            behandlingen. Om den registrerade har tillhandahållit ett skriftligt samtycke utgör samtycket den lagliga
                                            grunden för en sådan behandling. Den registrerade har rätt att när som helst motsätta sig denna
                                            behandling.
                                            De uppgifter som kan komma att behandlas är namn, adress, telefonnummer och e- postadresser till
                                            arbetsplatsen samt eventuella uppgifter om avdelningstillhörighet och befattning.
                                        </Text>
                                        <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                            Om cookies
                                        </Text>
                                        <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            När du besöker vår hemsida lagras så kallade cookies (kakor) på din dator. Det är små textfiler med
                                            information som används för att identifiera din dator, anpassa innehållet vi visar och således förbättra din
                                            användarupplevelse. Information lagras om din användning och vilka sidor som besökts. Det kan vara
                                            teknisk information om din enhet och internetuppkoppling såsom operativsystem, webbläsarversion,
                                            IP-adress och unika identifierare. Vid besök på våra webbplatser kan olika tekniker användas för att
                                            känna igen dig i syfte att lära oss mer om våra användare. Detta kan ske direkt eller genom användning
                                            av teknik från tredje part.
                                            Om du inte vill ta emot cookies så kan du blockera alla cookies, ta bort nuvarande cookies från datorn
                                            eller ställa in så att du får en varning varje gång en cookie sparas.
                                        </Text>
                                        <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                            Kommer vi dela vidare din information?
                                        </Text>
                                        <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            Vi kommer aldrig att sälja dina personuppgifter till tredje part utan din tillåtelse . Ibland delar vi dina
                                            personuppgifter till leverantörer eller underleverantörer för att kunna utförandet våra åtaganden gentemot
                                            dig. Vi följer legala, tekniska och organisatoriska krav för att din information ska hanteras säkert.
                                            Om Safety Zone eller en väsentlig del av Safety Zone:s tillgångar förvärvas av en tredje part, kan
                                            personuppgifter om Safety Zone kunder komma att delas vidare till den tredje parten, för att uppdraget
                                            ska kunna drivas vidare.
                                        </Text>
                                        <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                            Var behandlar vi dina personuppgifter?
                                        </Text>
                                        <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            Vi strävar efter att alltid lagra dina personuppgifter inom EU/EES. Dock kan dem i vissa situationer
                                            behandlas utanför EU/EES av en tredje part, till exempel en teknikleverantör eller underleverantör. Vi
                                            kommer alltid att vidta rimliga legala, tekniska och organisatoriska åtgärder för att din information ska
                                            hanteras i samma nivå som det skydd som erbjuds inom EU/EES.
                                        </Text>
                                        <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                            Hur länge sparar vi dina personuppgifter?
                                        </Text>
                                        <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            Vi sparar data så länge som det är nödvändigt för att uppfylla det syfte för vilket informationen samlades
                                            in, eller för att utföra våra åtaganden och så länge det krävs enligt lagstadgade lagringstider, särskilt vad
                                            gäller redovisningskrav.
                                        </Text>
                                        <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                            Säkerhet
                                        </Text>
                                        <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            Safety Zone:s utgångspunkt när vi behandlar personuppgifter är att det endast är de personer i vår
                                            verksamhet där det finns ett arbetsrelaterat behov avseende just de här personuppgifterna som har
                                            tillgång. Safety Zone har implementerat säkerhetsåtgärder för att skydda dina personuppgifter mot olovlig
                                            eller obehörig behandling. Dessa säkerhetsrutiner förändras ständigt i takt med den tekniska
                                            utvecklingen. Vi använder IT-system för att skydda sekretessen, integriteten och tillgången till
                                            personuppgifter.
                                        </Text>
                                        <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                            Dina rättigheter
                                        </Text>
                                        <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            Du som registrerad hos oss har flera rättigheter som du bör känna till. Du har rätt att kostnadsfritt, en
                                            gång per år, begära ett registerutdrag. Du har rätt till att få dina personuppgifter korrigerade om de är
                                            felaktiga, ofullständiga eller missvisande och rätt att begränsa behandlingen av personuppgifter tills de
                                            blir ändrade.
                                            Du har rätten att bli glömd, men radering av personuppgifter kan inte ske om det krävs för att fullgöra
                                            avtalet eller om annan svensk eller europeisk lag, domstols- eller myndighetsbeslut säger annat, samt om
                                            det baseras på berättigat intresse. Skulle du tycka att det inte finns berättigade skäl eller att berättigat
                                            intresse är felaktig har du rätt att invända mot behandlingen.
                                            Du har också rätt att dra in ett samtycke, lämna klagomål om behandlingen till Datainspektionen och
                                            invända mot direktmarknadsföring.
                                        </Text>
                                        <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                            Ändring av dataskyddspolicyn
                                        </Text>
                                        <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            Vi kan komma att uppdatera denna integritetspolicy. Vi kommer meddela ändring på www.safety-zone.se
                                            och även upplysa om ändringarna vi gjort i integritetspolicyn. Du kan alltid kontakta oss om du vill ha
                                            tillgång till tidigare versioner.
                                        </Text>
                                        <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                            Kontakta oss
                                        </Text>
                                        <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                            Vid frågor kring integritets- och dataskydd, vänligen kontakta oss på info@safety-zone.se
                                        </Text>
                                    </View>
                                }
                            </View>
                        </ScrollView>
                    </View>
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
        overflow: 'hidden',
        backgroundColor: '#4567f2',
        alignItems: 'center'
    },
    logo_view: {
        width: '60%',
        height: 30,
        marginTop: 40,
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
        justifyContent: 'center',
    },
    icon_view: {
        width: '20%',
        height: '40%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    subtitle_view: {
        width: '60%',
        height: '60%',
        // alignItems: 'center',
        justifyContent: 'center',
    },
    arrow_icon_view: {
        width: '20%',
        height: '20%',
        alignItems: 'center',
    },
    contents_text: {
        fontSize: 15, 
        // fontFamily: 'coreSansBold', 
        color: '#ffffff', 
        // textAlign:'justify', 
        lineHeight: 20, 
        paddingTop: Platform.OS === 'android' ? 0 : 7
    },
    banner_section: {
        position: 'absolute',
        width: '100%',
        height: bannerHeight,
        bottom: 0,
        backgroundColor: '#392b59',
    },

    
});