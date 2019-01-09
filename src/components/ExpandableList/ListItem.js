import React, {Component} from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';

import {
    CoreSnasCRLight,
    CoreSnasCRRegular,
    CoreSnasCRBold,
} from '../../Global/Global'


class ListItem extends Component {

    async componentWillMount() {
        //fonts
        await Expo.Font.loadAsync({
            coreSansLight: CoreSnasCRLight,
            coreSansRegular: CoreSnasCRRegular,
            coreSansBold: CoreSnasCRBold,
        });
    }

    render() {

        const {item, index, selectedItem, itemPicker} = this.props;

        return (

            <TouchableOpacity  style={selectedItem === item ? {display: 'none'} : {}} onPress={() => itemPicker(item, index)}>
                <View style={styles.container}>
                    <Text style = {{fontFamily: 'coreSansBold', fontSize: 15, marginTop: 5}}>{item}</Text>
                </View>
            </TouchableOpacity>
        );
    }
}

export default ListItem;

const styles = {
    container: {
        justifyContent: 'center',
    }
}

