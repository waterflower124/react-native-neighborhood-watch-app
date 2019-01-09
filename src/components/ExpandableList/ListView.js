import React, {Component} from 'react';
import {View, Text, TouchableOpacity, ScrollView, Image, Alert} from 'react-native';

import ListItem from './ListItem';
import {
    CoreSnasCRLight,
    CoreSnasCRRegular,
    CoreSnasCRBold,
} from '../../Global/Global'
class ListView extends Component {

    constructor(props) {
        super(props);

        this.state = {
            remove_border: false,           
        };


    }

    removeBorder = () => {
        if(this.state.remove_border)
            this.setState({remove_border: false});
        else 
            this.setState({remove_border: true});
    }

    async componentWillMount() {
        //fonts
        await Expo.Font.loadAsync({
            coreSansLight: CoreSnasCRLight,
            coreSansRegular: CoreSnasCRRegular,
            coreSansBold: CoreSnasCRBold,
        });
    }

    render() {
        const { data, selectedItem, expandList, itemPicker, expanded } = this.props;
        return (

            <ScrollView style={styles.container}>
                
                    <View style={styles.listHeader}>
                    <TouchableOpacity onPress={() => {expandList();}}>
                        <Text style = {{width: '100%', fontFamily: "coreSansBold", fontSize: 15}}>{selectedItem !== "" ? selectedItem : 'Apparel'}</Text>
                        {/* <View style={styles.iconStyle}>
                            <TouchableOpacity onPress={() => {expandList();}}>
                                <Image style = {{width: 30, height: 30}} source={require('../../assets/icons/sortdown.png')}/>
                            </TouchableOpacity>
                        </View> */}
                    </TouchableOpacity>
                    </View>
                
                {
                    expanded ?  <View style = {{marginLeft: 15}}>
                    {
                        data.map((item, index) => <ListItem 
                                                    key={index}
                                                    index={index} 
                                                    item={item}
                                                    itemPicker={itemPicker}
                                                    selectedItem={selectedItem}
                                                    />)
                    }
                </View> : null
                }
            </ScrollView>
        );
    }
}

export default ListView;

const styles = {
    listHeader: {
        // justifyContent: 'center',
        // flexDirection: 'row',
        // borderWidth: 1,
        // borderColor:'#e9e3d5'
        marginLeft: 15
    },
    iconStyle: {
        width: '25%', 
        borderLeftWidth: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        borderColor:'#e9e3d5'
    }
}

