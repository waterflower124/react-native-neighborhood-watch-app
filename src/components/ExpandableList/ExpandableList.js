
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';

import ListView from './ListView';



export default class ExpandableList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: this.props.data,
      type: this.props.type,
      expanded: false,
      selectedItem: ''
    };

  }


 render() {
   return (
     <View style={[styles.container, this.props.containerStyle]}>
       <ListView selectedItem={this.props.selectedItem} 
                 expandList={this.props.expandList} 
                 itemPicker={this.props.itemPicker} 
                 data={this.props.data}
                 expanded={this.props.expanded}
                 />
     </View>
   );
 }
}

const styles = StyleSheet.create({
  container: {
    // background:'transparent'
    // backgroundColor: 'red'
  },
});
