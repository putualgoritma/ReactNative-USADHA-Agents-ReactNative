import React, {useState, useEffect} from 'react';
import {Alert, StyleSheet, Text, View, Image} from 'react-native';
import {ScrollView, TouchableOpacity, TextInput} from 'react-native-gesture-handler';
import {HeaderComponent, Releoder, ButtonCustom} from '../../component';
import {colors} from '../../utils/colors';
import Axios from 'axios';
import {useSelector} from 'react-redux';
import {Rupiah} from '../../helper/Rupiah';
import Config from 'react-native-config';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useIsFocused } from '@react-navigation/native';

const TransferStock = ({navigation, route}) => {
  const [dataHistory, setDataHistory] = useState({});
  const [loading, setLoading] = useState(true);
  const userReducer = useSelector((state) => state.UserReducer);
  const TOKEN = useSelector((state) => state.TokenApi);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isDisabledmax, setIsDisabledmax] = useState(false);
  const [transferTo, setTransferTo] = useState('');
  const [transferToId, setTransferToId] = useState('');
  const isFocused = useIsFocused();
  
  useEffect(() => {
    if (route.params) {
      //alert('data scan '+route.params.agentId)
      setTransferToId(route.params.agentId)
      setTransferTo(route.params.agentTo)
    }
    Axios.get(Config.API_PRODUCT_STOCK + `${userReducer.id}`, {
      headers : {
        Authorization: `Bearer ${TOKEN}`,
        'Accept' : 'application/json' 
      }
    })
    .then((res) => {
      let jsonArray = [];
      let jsonObject = '';      
      res.data.data.map((item, index) => {
        if(item.quantity_balance>0){
        jsonObject = { id : item.id, name : item.name, qty : item.quantity_balance, img : item.img, price : item.price, maxqty : item.quantity_balance};
        jsonArray.push(jsonObject);
        }
      })
      setDataHistory(jsonArray)
      console.log('jsonArray', jsonArray)
      console.log('notif', res.data.data)
      setLoading(false)
    }).catch((err) => {
      setLoading(false)
      alert('mohon di coba kembali')
      navigation.goBack()
    })
  }, [isFocused])

  const quantity = (id, type, cart) => {
    let jsonArray = [];
      let jsonObject = '';    
      let qty = 0; 
    if (type === 'MIN') {       
      dataHistory.map((item, index) => {
        qty = parseInt(item.qty);
        if(id == item.id){
          qty = parseInt(item.qty) - 1;
        }
        if (qty < 0) {
          setIsDisabled(true);
          qty  = 0;
        }else{
          setIsDisabledmax(false)        
        }
        jsonObject = { id : item.id, name : item.name, qty : qty, img : item.img, price : item.price, maxqty : item.maxqty};
        jsonArray.push(jsonObject);
      })
      setDataHistory(jsonArray)
    } else if (type === 'PLUSH') {
      dataHistory.map((item, index) => {
        qty = parseInt(item.qty);
        if(id == item.id){
          qty = parseInt(item.qty) + 1;
        }
        if (qty > item.maxqty) {
          setIsDisabledmax(true);
          qty = item.maxqty;
        }else{
          setIsDisabled(false);        
        }
        jsonObject = { id : item.id, name : item.name, qty : qty, img : item.img, price : item.price, maxqty : item.maxqty};
        jsonArray.push(jsonObject);
      })
      setDataHistory(jsonArray)
    }    
  };  

  const Transfer = () => {
    setLoading(true)
      var data = {
        cart: dataHistory,
        agent_from_id: userReducer.id,
        agent_to_id: transferToId
      }
      if (data.agent_to_id !='') {
       Axios.post(Config.API_TRANSFER_STOCK, data,
         {
           headers: {
             Authorization: `Bearer ${TOKEN}`,
             'Accept': 'application/json',
             'content-type': 'application/json'
           }
         }
       ).then((result) => {
         console.log('transefer', result.data)
          navigation.navigate('NotifAlert', { notif: 'Transfer Stok Sukses' })
         setLoading(false)
       }).catch((e) => {
         alert('tansfer gagal, jika tetap hubungi admin')
         console.log(e)
         setLoading(false)
       })
      console.log(data)
      setLoading(false)
    }else{
      alert('Data  belum lengkap !')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Releoder/>
    )
  }

  return (
    <View style={styles.container}>
      <HeaderComponent/>
        <View style={styles.contentHeader}>
          <Text style={styles.textKeranjang}>Transfer Stok</Text>
          <View style={styles.boxTitle}>
            <View style={styles.title}>              
            </View>            
          </View>
          <View style={{ flexDirection: 'row' }}>
            <TextInput editable={false} placeholder='Agen yang dituju' style={styles.search} value={transferTo} onChangeText={(item) => setTransferTo(item)} ></TextInput>
            <ButtonCustom
              name='Cari'
              width='40%'
              color={colors.btn}
              func={() => { navigation.navigate('AgentList', {redirect : 'list'}) }}
              height={50}
            />            
          </View>
          <Text style={styles.title}> </Text>
        </View>
      <ScrollView style={styles.scroll}>
        {dataHistory.map((cart) => {
          return (
            <View>
      <View style={styles.containerList}>
        <View style={styles.detail}>
          <Image source={{uri : `https://admin.belogherbal.com/${cart.img}`}} style={styles.image} />
          <View style={styles.textContent}>
            <Text style={styles.title}>{cart.name} </Text>
            <Text style={styles.harga}>{Rupiah(cart.price)}</Text>
          </View>
        </View>
        <View style={styles.formNote}>          
          <TouchableOpacity
            onPress={() => {
              quantity(cart.id, 'MIN', cart);
            }}
            disabled={isDisabled}>
            <Icon name="minus" style={styles.iconMin} />
          </TouchableOpacity>

          <Text style={styles.qty}>{cart.qty} </Text>

          <TouchableOpacity
            onPress={() => {
              quantity(cart.id, 'PLUSH', cart);
            }}
              disabled={isDisabledmax}>
            <Icon name="plus" style={styles.iconPlush} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.line} />
    </View>
          );
        })}
      </ScrollView>
      <View
        //  style={{display: display}}
        style={{
          backgroundColor: '#ffffff',
          height: 55,
          // borderWidth: 1,
          // borderColor: colors.disable,
          alignItems: 'center',
          justifyContent: 'center',
          // color : nominalTransfer
        }}>
        <ButtonCustom
              name='Transfer'
              width='85%'
              
              color={colors.btn}
              // func = {() => {generateCodeOTP(); setModalVisible(true)}}
              func={() => Alert.alert(
                'Peringatan',
                `Anda akan melakukan Transfer ke ${transferTo} ? `,
                [
                  {
                    text: 'Tidak',
                    onPress: () => console.log('tidak')
                  },
                  {
                    text: 'Ya',
                    onPress: () => Transfer()
                  }
                ]
              )}
            />
      </View>
    </View>
  );
};

export default TransferStock;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  contentHeader: {
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.disable,
  },
  textKeranjang: {
    fontSize: 25,
    marginBottom: 10,
  },
  boxTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    // justifyContent : 'space-between',
    marginTop: 30,
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  checkbox: {
    alignSelf: 'center',
  },
  textHapus: {
    // marginLeft: 140,
    color: colors.default,
    fontWeight: 'bold',
  },
  line: {
    marginTop: 10,
    borderColor: colors.disable,
    borderWidth: 4,
  },
  boxTotal: {
    // alignItems: "flex-end",
    height: 60,
    // backgroundColor : 'red',
    paddingHorizontal: 20,
    paddingTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.disable,
  },
  textTotal: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  hargaTotal: {
    fontSize: 16,
  },
  btnBeli: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  borderBtn: {
    borderWidth: 2,
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 10,
    justifyContent: 'center',
    borderColor: colors.btn,
    backgroundColor: colors.btn,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  containerList: {
    marginTop: 40,
    padding: 20,
    flex: 1,
    flexDirection: 'column',
    // marginBottom :
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  textContent: {
    paddingHorizontal: 10,
    width: 250,
  },
  formNote: {
    // flex : 1,
    // backgroundColor : 'red',
    height: 65,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  note: {
    bottom: 10,
    borderBottomWidth: 1,
    width: 200,
    fontSize: 15,
    borderBottomColor: colors.default,
    // marginRight: 8,
  },
  iconMin: {
    fontSize: 20,
    color: '#ffffff',
    paddingHorizontal: 6,
    borderWidth: 1,
    borderRadius: 50,
    textAlign: 'center',
    paddingVertical: 4,
    backgroundColor: colors.default,
    borderColor: colors.default,
    // paddingHorizontal : 3
  },
  iconPlush: {
    fontSize: 20,
    color: '#ffffff',
    paddingHorizontal: 6,
    borderWidth: 1,
    borderRadius: 50,
    textAlign: 'center',
    paddingVertical: 4,
    backgroundColor: 'green',
    borderColor: 'green',
    // paddingHorizontal : 3
  },
  qty: {
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    width: 120,
    textAlign: 'center',
    fontSize: 20,
    borderBottomColor: colors.default,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 5,
    // marginLeft: 10,
  },
  textContent: {
    paddingHorizontal: 10,
    width: 250,
  },
  title: {
    fontSize: 15,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  harga: {
    fontWeight: 'bold',
  },
});
