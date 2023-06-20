import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { ButtonCustom, Header, HeaderComponent, ItemKeranjang, Releoder } from '../../component';
import { colors } from '../../utils/colors';
import { useIsFocused } from '@react-navigation/native';
import {
  change_to_qty,
  delete_cart,
  delete_cart_all,
  selected_cart,
} from '../../redux';
// import Axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { Rupiah } from '../../helper/Rupiah';
import Axios from 'axios';
import Config from "react-native-config";

function useForceUpdate() {
  const [refresh, setRefresh] = useState(0); // integer state
  return () => setRefresh((refresh) => ++refresh); // update the state to force render
}

const RO = ({ navigation, route }) => {
  const [isSelected, setIsSelected] = useState(false);
  const cartReducer = useSelector((state) => state.CartReducer);
  const isFocused = useIsFocused();
  // const [qtyInduk, setQtyInduk] = useState(1);
  const [total, setTotal] = useState(0);
  const dispatch = useDispatch();
  const [cartState, setCartState] = useState(cartReducer);
  const forceUpdate = useForceUpdate();
  const dataForm = route.params.dataForm;
  const dataType = route.params.dataType;
  const [dataCart, setDataCart] = useState([]);
  const userReducer = useSelector((state) => state.UserReducer);
  const [isLoading, setIsLoading] = useState(false);
  const TOKEN = useSelector((state) => state.TokenApi);

  //set nilai jika keranjang di buka ulang
  useEffect(() => {
    setTotal(cartState.total);
    setCartState(cartReducer);
    setIsSelected(false);
  }, [])

  useEffect(() => {
    // console.log(cartState);
    let data_arr = []
    cartState.item.map((cart) => {
      data_arr[data_arr.length] = {
        products_id: cart.id,
        price: cart.harga,
        quantity: cart.qty,
      };
    })
    setDataCart(data_arr);
    setTotal(cartState.total);
    setCartState(cartReducer);
    setIsSelected(false);
  }, [isFocused, cartState]);

  const quantity = (harga, type, cart) => {
    if (type === 'MIN') {
      if (cart.qty !== 0) {
        setTotal(cartReducer.total - harga);
        if (total <= 0) {
          setTotal(0);
        }
      }
    } else if (type === 'PLUSH') {
      setTotal(total + harga);
    }
    // console.log(cart.qty)
    dispatch(change_to_qty(cart.qty, cart.id, harga, type));
  };

  //delete item
  const deleteItem = (id, hargaTotal) => {
    dispatch(delete_cart(id));
    setCartState(cartReducer);
    setTotal(cartReducer.total);
    forceUpdate();
  };

  // delete all item 
  const deleteAll = () => {
    dispatch(delete_cart_all());
    // alert('asasasasasasas')
    setCartState(cartReducer);
    setTotal(cartReducer.total);
    setIsSelected(false);
    forceUpdate();
  };

  //memilih semua keranjang
  const checkAll = () => {
    var trueFalse;
    if (isSelected === false) {
      trueFalse = true;
    } else {
      trueFalse = false;
    }
    dispatch(selected_cart(null, trueFalse));
  };

  const actionTokenize = () => {
    let trs_type = 'ro'
    if(userReducer.agent_type == 'reseller'){
      trs_type = 'reseller'
    }
    
    let dataTokenize = {};
    dataTokenize.agent_id = userReducer.id;
    dataTokenize.customer_id = 0;
    dataTokenize.type = trs_type;
    dataTokenize.activation_type_id = 0;
    dataTokenize.old_activation_type_id = 0;
    dataTokenize.cart = dataCart
    dataTokenize.memo = dataForm.memo
    console.log('dataTokenize', dataTokenize)

    // if(nominal <= )
    setIsLoading(true)
    Axios.post(Config.API_TOKENIZE, dataTokenize,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Accept': 'application/json'
        }
      }
    ).then((res) => {
      console.log(res.data.message)
      // alert(res.data.message)
      navigation.navigate('NotifAlert', { notif: res.data.message + ' TOKEN: ' + res.data.token })
      setIsLoading(false)
    }).catch((e) => {
      var mes = JSON.parse(e.request._response);
      alert(mes.message)
      setIsLoading(false)
    })
  }

  if (isLoading) {
    return (
      <Releoder />
    )
  }

  return (
    <View style={styles.container}>
      <HeaderComponent />
      <View style={styles.contentHeader}>
        <Text style={styles.textKeranjang}>Keranjang</Text>
        <View style={styles.boxTitle}>
          <View style={styles.title}>
            <CheckBox
              onChange={checkAll}
              value={isSelected}
              onValueChange={setIsSelected}
              style={styles.checkbox}
            />
            <Text>Pilih Semua Barang</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              deleteAll();
            }}>
            <Text style={styles.textHapus}>Hapus</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={styles.scroll}>
        {cartState.item.map((cart) => {
          return (
            <ItemKeranjang
              key={cart.id}
              selected={isSelected}
              // selectedFalse={() => {selectedFalse()}}
              cart={cart}
              btnMin={() => {
                quantity(cart.harga, 'MIN', cart);
              }}
              btnPlush={() => {
                quantity(cart.harga, 'PLUSH', cart);
              }}
              deleteItem={() => {
                deleteItem(cart.id, cart.qty * cart.harga);
              }}
            />
          );
        })}
      </ScrollView>
      <View style={styles.boxTotal}>
        <View>
          <Text style={styles.textTotal}>Total Harga</Text>
          <Text style={styles.hargaTotal}>{Rupiah(total)} </Text>
        </View>
        <ButtonCustom
          name='Tambah'
          width='30%'
          color={colors.btn_primary}
          func={() => { navigation.navigate('Products', { dataForm: dataForm, dataType: dataType, activation_type_id: '' }) }}
        />
        {cartState.item.length == 0 ?
          (
            <ButtonCustom
              name='Token'
              width='30%'
              color={colors.disable}
              func={() => alert('Keranjang Kosong')}
            />
          )
          :
          (
            <ButtonCustom
              name='Token'
              width='30%'
              color={colors.btn}
              func={() => Alert.alert(
                'Peringatan',
                `Generate Token sekarang ? `,
                [
                  {
                    text: 'Tidak',
                    onPress: () => console.log('tidak')
                  },
                  {
                    text: 'Ya',
                    onPress: () => { actionTokenize() }
                  }
                ]
              )}
            />
          )
        }

      </View>
    </View>
  );
};

export default RO;

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
});
