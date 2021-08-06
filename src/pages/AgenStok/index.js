import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {colors} from '../../utils/colors';
import Icon from 'react-native-vector-icons/FontAwesome';
import {ScrollView, TextInput} from 'react-native-gesture-handler';
import {useDispatch, useSelector} from 'react-redux';
import Axios from 'axios';
import {Header2, Releoder} from '../../component';
import { Rupiah } from '../../helper/Rupiah';
import { SafeAreaView } from 'react-native-safe-area-context';
import Config from 'react-native-config';

const ItemHistory = (props) => {
  var color = '#61b15a';

  if(props.type == 'C'){
    color = 'red'
  }

  return (
    <View>
      <View style={{backgroundColor: '#f2efea'}}>
        <Text
          style={{
            marginHorizontal: 20,
            paddingVertical: 8,
            color: colors.dark,
            fontWeight: 'bold',
          }}>
          {props.date}
        </Text>
      </View>
      <View style={{paddingHorizontal: 20, paddingVertical: 10}}>
        <Text style={{fontWeight: 'bold', fontSize: 15}}>{props.jenis}</Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 8,
          }}>
          <Text style={{color: '#000'}}>Stok</Text>
          <Text style={{color: '#000'}}>{props.total}</Text>
        </View>
      </View>
    </View>
  );
};

const AgenStok = ({navigation}) => {
  const userReducer = useSelector((state) => state.UserReducer);
  const TOKEN = useSelector((state) => state.TokenApi);
  const [dataHistory, setDataHistory] = useState({}); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Axios.get(Config.API_PRODUCT_STOCK + `${userReducer.id}`, {
      headers : {
        Authorization: `Bearer ${TOKEN}`,
        'Accept' : 'application/json' 
      }
    })
    .then((res) => {
      // setProduct(res.data.data);
      // setLoading(false);
      setDataHistory(res.data.data)
      console.log('notif', res.data.data)
      setLoading(false)
    }).catch((err) => {
      setLoading(false)
      alert('mohon di coba kembali')
      navigation.goBack()
    })
  }, [])

  const dateRegister = () => {
      var todayTime = new Date();
      var month = todayTime.getMonth() + 1;
      var day = todayTime.getDate();
      var year = todayTime.getFullYear();
      return year + "-" + month + "-" + day;
      }

  if (loading) {
    return (
      <Releoder/>
    )
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={{flex: 1}}>
        <Header2 title ='Stock' btn={() => navigation.goBack()}/>
        <ScrollView>
          {/* <ItemHistory
            date="21 Oktober 2020"
            jenis="Telkomsel"
            total="20.000.000"
          /> */}
          {dataHistory.map ((item) => {
          return (
            <ItemHistory
            date={dateRegister()}
            jenis={item.name}
            total={item.quantity_balance}
            // type = {item.type}
            key = {item.id}
            />
          )
          })}
          
        </ScrollView>
      </View>
      {/* <View style={{ backgroundColor : '#ffffff', height : 55, borderWidth : 1, borderColor : colors.disable, alignItems : 'center', justifyContent : 'center'}}>
                        <TouchableOpacity style={{borderWidth:1, borderRadius : 50, backgroundColor : colors.disable, borderColor :colors.disable, paddingHorizontal: 100, paddingVertical : 5}}>
                              <Text style={{color : '#ffffff', fontWeight : 'bold', fontSize : 15}}>
                                    Top Up Sekarang
                              </Text>
                        </TouchableOpacity>
                  </View> */}
    </SafeAreaView>
  );
};

export default AgenStok;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    backgroundColor: colors.default,
    alignItems: 'center',
  },
  btnBack: {
    marginRight: 10,
  },
  textTopUp: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  textTambahKartu: {
    marginTop: 10,
    color: colors.dark,
  },
});
