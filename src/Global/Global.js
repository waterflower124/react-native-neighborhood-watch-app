
export default {
    
    language: 0,//1 is English, 0 is Sweden
    alarm_action: 0,
    alarm_sound_index: 0, // 0 is sound1,  1 is sound2,  2 is no sound
    alarm_vibration_action: 1, ///  0 is Off,  1 is On
    group_id: '',
    group_manager: false,
    token: '',
    fullname: '',
    address: '',

    countries: [],

    current_email: '',
    current_password: '',
    user_id: 0,///////DB index for the user

    notification_token: '',

    currentScreen: 'empty'

}

export const CoreSnasCRLight =  require('../assets/fonts/Core_Sans_CR_35_Light.ttf');
export const CoreSnasCRRegular =  require('../assets/fonts/Core_Sans_CR_45_Regular.ttf');
export const CoreSnasCRRegularItalic =  require('../assets/fonts/Core_Sans_CR_45_Regular_Italic.ttf');
export const CoreSnasCRBold =  require('../assets/fonts/Core_Sans_CR_65_Bold.ttf');
