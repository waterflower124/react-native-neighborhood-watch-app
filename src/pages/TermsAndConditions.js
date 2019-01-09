
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
    WebView,
    Linking,
 } from 'react-native';

import {Font, Constants} from 'expo';
import Communications from '../components/communication/AKCommunications';

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
// var mainSectionHeight = deviceHight - (topSectionHeight + bannerHeight + 40);
var mainSectionHeight = deviceHight - (topSectionHeight + 40);

export default class TermsAndConditions extends Component {
	static navigationOptions = {
		header: null,
	};

	constructor(props) {
        super(props);
        
        this.state = {
            isReady: false,

            selected_language: 1,

            ads_image: '',
            ads_link: '',
            ads_id: -1,

        };
    };

    initLanguage() {
        Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT);
        this.setState({selected_language: Global.language});


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
        });
        this.setState({isReady: true});

		// BackHandler.addEventListener('hardwareBackPress', () => {return true});
		// Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT);
        // StatusBar.setHidden(true);

        // alert(deviceHight + " " + mainSectionHeight + " " + topSectionHeight + " " + bannerHeight);
        
    };

    goSignIn = () => {
        this.setState({ads_image: ''});
        this.props.navigation.navigate('SignIn');
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
                        {/* <View style = {styles.logo_view}>
                            <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/home_logo.png')}/>
                        </View> */}
                        <Text style = {styles.title_text}>{this.state.selected_language === 0 ? 'Användarvillko' : 'Terms And Conditions'}</Text>
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
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        Please read these Terms of Use ("Terms") carefully before using the Safety Zone i Sverige AB mobile application.
                                        These services (Service / Services) are provided by Safety Zone i Sverige AB ("Safety Zone"). By using the
                                        Services, you agree to these Terms of Service ("Terms of Service") and our "Privacy Policy".
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        ("The Service") operated by Safety Zone i Sverige AB and its subsidiaries ("us", "we" or "our"). Your access to and
                                        use of the Service is subject to your acceptance and compliance with these Terms and Conditions. These terms and
                                        conditions apply to all visitors, users, and others who wish to access or use the Service. By accessing or using the
                                        Service, you agree to be bound by these Terms. If you do not agree to any of the terms, you are not authorized to
                                        access the service. By creating an account or profile at our service, you agree to subscribe to newsletters, promotions
                                        or promotional material and other information we can send. However, you can opt out to receive any or all of these
                                        messages from us by following the subscription or instructions link contained in all emails we send. The ad librarian
                                        located in the app can not be deleted. You also agree to receive warnings about incidents and events of activities
                                        around your neighborhood and other neighborhoods. The content of our service allows you to post, link, store, share
                                        and otherwise make available information, text, graphics, video clips or other material ("Content").
                                        You are responsible for the content you submit to or through the Service, is legal, reliable and appropriate. By
                                        posting content on or through the Service, you warrant that the Content is yours (You own it) and / or You are
                                        entitled to use it and also give us the rights and content and license as specified in these Terms and Conditions, and
                                        that the post of Your content on or through the Service does not violate personal data, publication rights, copyrights,
                                        contractual rights or other rights of any person or entity. We reserve the right to terminate the account of someone
                                        who violated copyright. You retain all your rights to content that you submit, post or display on or through the
                                        Service and you are responsible for protecting these rights. We accept no liability for the content you or any third
                                        party posted through the service. By transferring information to the Safety Zone i Sverige AB and making it
                                        available "publicly", you allow other users permission to use, reproduce, communicate, publish, publish publicly and
                                        distribute the content at no charge, provided that the information has not been changed or deleted. so that the result
                                        has become misleading or unclear. Users do not own the right to sell information or utilize it for commercial
                                        purposes without the approval of Safety Zone i Sverige AB. By posting content using the Service, you grant us the
                                        right to use, edit, publish, publish, reproduce and distribute such content on and through the Service. You agree that
                                        this license contains the right to make your content available to other users of the service, which may also use your
                                        content subject to these terms. Safety Zone i Sverige AB is correct but not required to monitor and edit all content
                                        provided by users. Additionally, content contained in or through this service is the property of Safety Zone i Sverige
                                        AB or used with permission. You may not distribute, modify, transmit, reuse, download, re-post, copy or use the
                                        said content, in whole or in part, for commercial or financial gain, without written permission from us. accounts
                                        When you create an account with us, you warrant that you are over 18 and the information you provide us is
                                        accurate, complete and current at all times. Incorrect, incomplete or outdated information may result in immediate
                                        termination of your account on the Service. You are responsible for maintaining the confidentiality of your account
                                        and password, including but not limited to the limitation of access to the computer and / or your account. You
                                        acknowledge that you accept responsibility for all activities or actions arising under your account and / or password,
                                        if your password is with our service or third party service. You must notify us immediately when you become aware
                                        of any breach of the security or unauthorized use of your account. Intellectual Property Rights The service and its
                                        original content (with the exception of content provided by users), features and functionality are and will remain the
                                        exclusive property of Safety Zone i Sverige AB and its licensors. The service is protected by copyright, trademark
                                        and other laws in Sweden. Our trademarks and apparel may not be used in connection with any product or service
                                        without the prior written consent of the Safety Zone i Sverige AB. Links to other sites Our service may contain links
                                        to third party websites or services not owned or controlled by Safety Zone i Sverige AB has no control over and is
                                        responsible for the content, privacy policy or practices of third party websites or services. We do not guarantee
                                        offers of any of these entities / individuals or their websites. You confirm and agree that the Safety Zone i Sverige
                                        AB does not directly or indirectly be responsible or liable for any loss or damage caused or alleged to be caused by
                                        or in connection with the use or dependence of such content, goods or services available on or through any such
                                        third party websites or services. We strongly recommend that you read the terms and conditions of the privacy
                                        policy.
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                        Termination:
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        We may terminate or suspend your account at any time in the event of breach of the terms or abuse of the Services.
                                        Services may not be used:
                                    </Text>
                                    <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        by organizations or users who encourage or advocate violence.
                                    </Text>
                                    <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        of unethical activity types or of doubtful nature.
                                    </Text>
                                    <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        to market or sell a product or service for commercial purposes.
                                    </Text>
                                    <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        to procrastinate or express themselves in descendants of other people or groups of people.
                                    </Text>
                                    <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        for criminal activities.
                                    </Text>
                                    <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        to encourage or establish the citizenship.
                                    </Text>
                                    <Text style = {[{fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        If you want to close your account, you can simply stop using the Service and remove the app from your device. All
                                        provisions of the terms which by their nature should exceed termination shall exceed termination, including but not
                                        limited to ownership, warranty terms, compensation and liability limits.
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                        Indemnification:
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        You agree to keep the Safety Zone i Sverige AB, its licensors and their employees, contractors, agents, officers and
                                        directors, from all claims, damages, liabilities, losses, liabilities, expenses or liabilities and expenses (including but
                                        not limited to attorneys fees) arising out of or arising from (a) your use and access to the Service, by you or anyone
                                        using your account and password; (b) a violation of these Terms; or (c) content published on the Service. Limitation
                                        of liability applies to Safety Zone i Sverige AB, or its directors, employees, partners, agents, suppliers or
                                        subsidiaries. Under no circumstances shall they be held liable for indirect, incidental, special, consequential or
                                        penalty charges, including without limitation loss of profit, data, use, goodwill or other intangible losses deriving
                                        from (1) your access to or use of or inability to come access or use the Service; (2) any conduct or content of any
                                        third party to the Service; (3) any content obtained from the Service and (4) unauthorized access, use or modification
                                        of your transfer or content, whether based on warranty, contract, damages (including negligence) or other legal
                                        theory, regardless of whether we have become informed about the risk of such damage or even if a means specified
                                        herein has been found to have failed with its main purpose. Warning! Your use of the Service is at your own risk.
                                        The service is provided on "AS IS" and "AVAILABLE" basis. Unless otherwise expressly stated in these terms or
                                        conditions, the Safety Zone i Sverige AB does not give any specific promises about the Services. For example, we
                                        do not make any commitments regarding the content of the Services, the Specific Features of the Services, their
                                        reliability, availability, or ability to meet your needs. We provide the Services in the current state. To the extent
                                        permitted by law, we disclaim all warranties. Safety Zone i Sverige AB is not responsible for any loss or damage
                                        caused directly or indirectly by or caused by the use of the Services, such as loss of earnings, income or lost data,
                                        financial or indirect damage, damages caused by special injury, consequential damages or damages. In all cases, the
                                        Safety Zone i Sverige AB's liability is limited to an amount not exceeding 500 kr. Under no circumstances shall
                                        Safety Zone i Sverige AB and its suppliers and distributors be liable for any loss or damage that might arise from the
                                        presumption. The service is provided without warranty of any kind, whether express or implied, including but not
                                        limited to implied warranties of merchantability, fitness for a particular purpose, non-compliance or result. Safety
                                        Zone i Sverige AB, its affiliates, subsidiaries and its licensors do not warrant that: a) The service will work
                                        continuously, safe or available at any given time or place. B) Any errors will be corrected. C) The service is free
                                        from viruses or other harmful components. or (d) the results of the use of the service will meet your requirements. If
                                        any provision of these Terms is deemed to be invalid or inexcusable by a court, the remaining provisions of these
                                        Terms will remain in force. These terms and conditions constitute the entire agreement between us on our Service
                                        and supersede any prior agreements that we may have had between us regarding the Service.
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                        Change:
                                    </Text>
                                    <Text style = {[{marginTop: 20, marginBottom: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        We reserve the right to change or replace these terms at any time, at our sole discretion. If a reassessment is
                                        essential, we will notify you at least 60 days before any new terms come into force. What constitutes a material
                                        change will be determined in our sole discretion. By continuing to access or use our service after any changes have
                                        come into effect, you acknowledge that they are bound by the revised terms. If you do not agree to the new terms,
                                        you will no longer have permission to use the service. Contact us If you have any questions about these terms,
                                        contact us at the following email: info@safety-zone.se
                                    </Text>
                                </View>
                            }
                            {
                                (this.state.selected_language === 0) &&
                                <View style = {{width: '95%', }}>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        Läs igenom dessa användarvillkor ("Villkor") noga innan du använder Safety Zone i Sverige
                                        AB:s mobilapplikation. Dessa tjänster (Tjänsten / Tjänsterna) tillhandahålls av Safety Zone i
                                        Sverige AB (”Safety Zone”). Genom att använda Tjänsterna accepterar du dessa
                                        användarvillkor (“Användarvillkoren”) och vår “Sekretesspolicy”.
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        ("Tjänsten") som drivs av Safety Zone i Sverige AB och dess dotterbolag ("oss "," vi "eller" vår
                                        "). Din tillgång till och användning av Tjänsten är villkorad av att du accepterar och följer dessa
                                        Villkor. Dessa villkor gäller för alla besökare, användare och andra som vill komma åt eller
                                        använda Tjänsten. Genom att komma åt eller använda Tjänsten accepterar du att vara bunden
                                        av dessa Villkor. Om du inte håller med någon del av villkoren har du inte behörighet att komma
                                        åt tjänsten. Genom att skapa ett konto eller profil på vår tjänst, accepterar du att prenumerera
                                        på nyhetsbrev, marknadsföring eller reklammaterial och annan information vi kan skicka. Du kan
                                        dock välja bort att ta emot några eller alla av dessa meddelanden från oss genom att följa
                                        länken för abonnemang eller instruktioner som finns i alla e-postmeddelanden som vi skickar.
                                        Reklambannern som ligger i appen går ej att välja bort. Du godkänner också att få varningar om
                                        incidenter och händelser av aktiviteter runt ditt grannskap och andra grannskap. Innehållet i Vår
                                        tjänst gör att du kan posta, länka, lagra, dela och på annat sätt göra tillgänglig information, text,
                                        grafik, videoklipp eller annat material ("Innehåll"). Du är ansvarig för innehållet som du skickar in
                                        på eller via Tjänsten, är laglig, tillförlitlighet och lämplig. Genom att lägga ut innehåll på eller via
                                        tjänsten, garanterar du att innehållet är ditt (du äger det) och / eller du har rätt att använda det
                                        och även ge oss rättigheter och innehåll och licens som som anges i dessa villkor, och att
                                        inlägget av ditt innehåll på eller via tjänsten inte bryter mot personuppgifter,
                                        publikations-rättigheter, upphovsrättigheter, avtalsrättigheter eller andra rättigheter för någon
                                        person eller enhet. Vi förbehåller oss rätten att säga upp kontot om någon som brutit mot
                                        upphovsrätten. Du behåller alla dina rättigheter till innehåll som du skickar in, postar eller visar
                                        på eller genom Tjänsten och du är ansvarig för att skydda dessa rättigheter. Vi tar inget ansvar
                                        för innehållet du eller någon tredje part lagt in genom tjänsten. Genom att överföra information
                                        till Safety Zone i Sverige AB och göra den tillgänglig ”offentligt”, ger du andra användare
                                        tillåtelse att använda, återge, kommunicera, publicera, framföra offentligt och distribuera
                                        innehållet, helt utan kostnad, under förutsättning att informationen inte förändrats eller styckats
                                        så att resultatet blivit vilseledande eller otydligt. Användare äger inte rätt att sälja information
                                        alternativt utnyttja den i kommersiellt syfte utan godkännande från Safety Zone i Sverige AB.
                                        Genom att posta innehåll med hjälp av tjänsten ger du oss rätten att använda, ändra, publicera,
                                        publicera, reproducera och distribuera sådant innehåll på och via tjänsten. Du godkänner att
                                        denna licens innehåller rätten att göra ditt innehåll tillgängligt för andra användare av tjänsten,
                                        som också kan använda ditt innehållsämne enligt dessa villkor. Safety Zone i Sverige AB har
                                        rätt men inte skyldigheten att övervaka och redigera allt innehåll som tillhandahålls av
                                        användarna. Dessutom är innehåll som finns på eller genom denna tjänst äganderätten till
                                        Safety Zone i Sverige AB eller används med tillstånd. Du får inte distribuera, modifiera, sända,
                                        återanvända, ladda ner, re-posta, kopiera eller använda det nämnda innehållet, helt eller delvis,
                                        för kommersiella ändamål eller för ekonomisk vinst, utan skriftligt tillstånd från oss. konton När
                                        du skapar ett konto hos oss garanterar du att du är över 18 år och att den information du ger
                                        oss är korrekt, fullständig och aktuell hela tiden. Felaktig, ofullständig eller föråldrad information
                                        kan leda till omedelbar uppsägning av ditt konto på Tjänsten. Du är ansvarig för att upprätthålla
                                        sekretessen för ditt konto och lösenord, inklusive men inte begränsat till begränsningen av
                                        åtkomst till datorn och / eller ditt konto. Du godkänner att du accepterar ansvar för alla aktiviteter
                                        eller åtgärder som uppstår under ditt konto och / eller lösenord, om ditt lösenord är med vår
                                        service eller en tredje parts tjänst. Du måste meddela oss omedelbart när du blir medveten om
                                        eventuella brott mot säkerheten eller obehörig användning av ditt konto. Immateriell äganderätt
                                        Tjänsten och dess ursprungliga innehåll (med undantag av innehåll som tillhandahålls av
                                        användare), funktioner och funktionalitet är och kommer att förbli den exklusiva äganderätten till
                                        Safety Zone i Sverige AB och dess licensgivare. Tjänsten är skyddad av upphovsrätt,
                                        varumärke och andra lagar i Sverige. Våra varumärken och klädsel får inte användas i samband
                                        med någon produkt eller tjänst utan föregående skriftligt samtycke från Safety Zone i Sverige
                                        AB. Länkar till andra webbplatser Vår tjänst kan innehålla länkar till tredje parts webbplatser
                                        eller tjänster som inte ägs eller kontrolleras av Safety Zone i Sverige AB har ingen kontroll över
                                        och tar inget ansvar för innehållet, sekretesspolicy eller praxis på tredje parts webbplatser eller
                                        tjänster. Vi garanterar inte erbjudanden av någon av dessa enheter / individer eller deras
                                        webbplatser. Du bekräftar och godkänner att Safety Zone i Sverige AB inte direkt eller indirekt
                                        ansvarar eller ansvarar för skada eller förlust som orsakas eller påstås vara orsakad av eller i
                                        samband med användning av eller beroende av sådant innehåll, varor eller tjänster som är
                                        tillgängliga på eller genom någon sådan tredje parts webbplatser eller tjänster. Vi
                                        rekommenderar starkt dig att läsa villkoren och sekretesspolicy.
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                        Uppsägning:
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        Vi kan när som helst säga upp eller tillfälligt upphäva ditt konto vid åsidosättande av villkoren
                                        eller missbruk av tjänsterna. Tjänsterna får inte användas:
                                    </Text>
                                    <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        - av organisationer eller användare som uppmuntrar eller förespråkar våld.
                                    </Text>
                                    <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        - av oetiska verksamhetstyper eller av tvivelaktig karaktär
                                    </Text>
                                    <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        - för att marknadsföra eller sälja en produkt eller tjänst i kommersiellt syfte
                                    </Text>
                                    <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        - för att förtala eller uttrycka sig nedvärderande om andra människor eller folkgrupper
                                    </Text>
                                    <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        - för brottsliga aktiviteter
                                    </Text>
                                    <Text style = {[{marginLeft: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        - för att uppmuntra eller etablera medborgargarden
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        Om du vill avsluta ditt konto kan du helt enkelt sluta använda Tjänsten och ta bort appen från
                                        din enhet. Alla bestämmelser i de villkor som enligt deras natur bör övergå uppsägning ska
                                        överstiga uppsägning, inklusive, men inte begränsat, äganderätt, garantivillkor, ersättning och
                                        ansvarsbegränsningar.
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                        Skadeersättning:
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        Du samtycker till att hålla Safety Zone i Sverige AB, dess licensgivare samt deras anställda,
                                        entreprenörer, agenter, tjänstemän och direktörer, från alla krav, skador, förpliktelser, förluster,
                                        skulder, kostnader eller skulder och utgifter (inklusive men inte begränsade till advokatavgifter)
                                        som följer av eller uppstår av a) din användning och tillgång till Tjänsten, av dig eller någon som
                                        använder ditt konto och lösenord b) ett brott mot dessa villkor, eller c) innehåll som publicerats
                                        på tjänsten. Ansvarsbegränsning gäller Safety Zone i Sverige AB, eller dess styrelseledamöter,
                                        anställda, samarbetspartners, agenter, leverantörer eller dotterbolag. Dessa får under inga
                                        omständigheter hållas ansvarig för indirekta, oavsiktliga, särskilda, följdskador eller
                                        straffavgifter, inklusive utan begränsning förlust av vinst, data, användning, goodwill eller andra
                                        immateriella förluster som härrör från (1) din tillgång till eller användning av eller oförmåga att
                                        komma åt eller använda Tjänsten; (2) något beteende eller innehåll av någon tredje part på
                                        Tjänsten; (3) något innehåll som erhållits från Tjänsten och (4) obehörig tillgång, användning
                                        eller ändring av dina överföringar eller innehåll, vare sig det är baserat på garanti, kontrakt,
                                        skadestånd (inklusive försumlighet) eller annan juridisk teori, oavsett om vi har blivit informerade
                                        om risken för sådan skada eller till och med om ett medel som anges häri har visat sig ha
                                        misslyckats med dess huvudsakliga syfte. Varning! Din användning av Tjänsten sker på egen
                                        risk. Tjänsten tillhandahålls på "SOM DEN ÄR" och "SOM TILLGÄNGLIG" basis. Om inte annat
                                        uttryckligen anges i dessa villkor eller ytterligare villkor lämnar inte Safety Zone några specifika
                                        löften om Tjänsterna. Vi gör exempelvis inga åtaganden om innehållet i Tjänsterna, Tjänsternas
                                        specifika funktioner, deras tillförlitlighet, tillgänglighet, eller förmåga att uppfylla dina behov. Vi
                                        tillhandahåller Tjänsterna i befintligt skick. I den mån det är tillåtet enligt lag friskriver vi oss från
                                        alla garantier. Safety Zone är inte ansvariga för skada eller förlust som direkt eller indirekt
                                        uppkommer genom eller orsakas av användningen av Tjänsterna, exempelvis för utebliven
                                        vinst, intäkt eller förlorad data, ekonomisk eller indirekt skada, skadestånd på grund av särskild
                                        skada, följdskada eller skadestånd. I samtliga fall är Safety Zone i Sverige AB:s
                                        skadeståndsansvar begränsat till ett belopp om högst 500 kr. Under inga omständigheter ska
                                        Safety Zone i Sverige AB och dess leverantörer och distributörer vara ansvariga för någon
                                        förlust eller skada som eventuellt mot förmodan skulle kunna uppstå. Tjänsten tillhandahålls
                                        utan garantier av något slag, oavsett om det är uttryckligt eller underförstått, inklusive, men inte
                                        begränsat till, underförstådda garantier för säljbarhet, lämplighet för ett visst ändamål, bristande
                                        överträdelse eller resultat. Safety Zone i Sverige AB, dess dotterbolag, dotterbolag och dess
                                        licensgivare garanterar inte att a) Tjänsten kommer att fungera oavbrutet, är säker eller
                                        tillgänglig vid en viss tidpunkt eller plats b) eventuella fel kommer att korrigeras c) Tjänsten är fri
                                        från virus eller andra skadliga komponenter. eller d) resultaten av användningen av tjänsten
                                        kommer att uppfylla dina krav. Om någon bestämmelse i dessa Villkor anses vara ogiltig eller
                                        oförklarlig av en domstol kommer de återstående bestämmelserna i dessa Villkor att förbli i
                                        kraft. Dessa villkor utgör hela avtalet mellan oss om vår Service och ersätter eventuella tidigare
                                        avtal som vi kan ha haft mellan oss om Tjänsten.
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansBold'}, styles.contents_text]}>
                                        Förändringar:
                                    </Text>
                                    <Text style = {[{marginTop: 20, fontFamily: 'coreSansRegular'}, styles.contents_text]}>
                                        Vi förbehåller oss rätten att när som helst, efter eget gottfinnande ändra eller ersätta dessa
                                        villkor. Om en omprövning är väsentlig kommer vi att meddela minst 60 dagar innan några nya
                                        villkor träder i kraft. Vad som utgör en väsentlig förändring kommer att bestämmas enligt vårt
                                        eget gottfinnande. Genom att fortsätta att komma åt eller använda vår tjänst efter att några
                                        ändringar har trätt i kraft, godkänner du att de är bundna av de reviderade villkoren. Om du inte
                                        godkänner de nya villkoren har du inte längre behörighet att använda tjänsten. Kontakta oss Om
                                        du har några frågor om dessa villkor, kontakta oss på följande email: info@safety-zone.se.
                                    </Text>
                                </View>
                            }
                            </View>
                        </ScrollView>
                    </View>
                </View>
                {/* <TouchableOpacity style = {styles.banner_section} onPress = {() => this.onClickAds()}>
                {
                    (this.state.ads_image !== '')&&
                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {{uri: this.state.ads_image}}/>
                }
                </TouchableOpacity> */}
                
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