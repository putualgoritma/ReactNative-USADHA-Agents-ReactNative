import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { ButtonCustom, Header, HeaderComponent, ItemKeranjang, Releoder } from '../../component';
import { colors } from '../../utils/colors';
import { useIsFocused } from '@react-navigation/native';
import { RadioButton } from 'react-native-paper';
import {
  change_to_package_qty,
  delete_package,
  delete_package_all,
  selected_package,
} from '../../redux';
import { useSelector, useDispatch } from 'react-redux';
import { Rupiah } from '../../helper/Rupiah';
import { Numformat } from '../../helper/Numformat';
import Axios from 'axios';
import Config from "react-native-config";
function useForceUpdate() {
  const [refresh, setRefresh] = useState(0); // integer state
  return () => setRefresh((refresh) => ++refresh); // update the state to force render
}

const Package = ({ navigation, route }) => {
  const [isSelected, setIsSelected] = useState(false);
  const cartReducer = useSelector((state) => state.PackageReducer);
  const isFocused = useIsFocused();
  // const [qtyInduk, setQtyInduk] = useState(1);
  const [total, setTotal] = useState(0);
  const [bv, setBv] = useState(0);
  const dispatch = useDispatch();
  const [cartState, setCartState] = useState(cartReducer);
  const forceUpdate = useForceUpdate();
  const [checked, setChecked] = useState('silver');
  const [activations, setActivations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const TOKEN = useSelector((state) => state.TokenApi);
  const [bvmin, setBvmin] = useState(0);
  const dataForm = route.params.dataForm;
  const dataType = route.params.dataType;
  const [activationType, setActivationType] = useState(2);
  const [checkeddef, setCheckeddef] = useState(0);
  const userReducer = useSelector((state) => state.UserReducer);
  const [actBalance, setActBalance] = useState(0);
  const [form, setForm] = useState(route.params.dataForm);
  const [dataCart, setDataCart] = useState([]);

  useEffect(() => {
    console.log('userReducer.id', userReducer.id)
    console.log('dataFormm', dataForm)
    console.log('dataType', dataType)

    let data_arr = []
    cartState.item.map((cart) => {
      data_arr[data_arr.length] = {
        products_id: cart.id,
        price: cart.harga,
        quantity: cart.qty,
      };
    })
    setDataCart(data_arr);


    if (isFocused) {
      setIsLoading(true)
      setTotal(cartState.total);
      setBv(cartState.bv);
      setCartState(cartReducer);
      setIsSelected(false);
      getData();
      console.log('activations', activations)
    }
  }, [isFocused, cartState]);

  const checkBvmin = (a, b, c) => {
    setBvmin(a)
    setActivationType(b)
  };

  const getData = async () => {
    //console.log('dataType',dataType)    
    Promise.all([apiActivations(), getActBalance()]).then(res => {
      console.log('promise')
      console.log('apiActivations', res[0])
      console.log('actBalance', res[1])
      let dataActivationsArr = []
      let bvPrev = 0
      let firstSelected = 0
      if (dataType == 'Upgrade') {
        //alert('Upgrade')
        console.log('Upgrade', dataType)
        let dataActivations = res[0]
        dataActivations.map((item, index) => {
          if (item.id == dataForm.activation_type_id) {
            bvPrev = res[1]
          }
          if (item.id > dataForm.activation_type_id) {
            dataActivationsArr[index] = { id: item.id, name: item.name, type: item.type, bv_min: item.bv_min - bvPrev, bv_max: item.bv_max - bvPrev }
            if (firstSelected == 0 && checkeddef == 0) {
              setChecked(item.name)
              setBvmin((item.bv_min - bvPrev) * 1000)
              setActivationType(item.id)
              setCheckeddef(1)
            }
            firstSelected = firstSelected + 1
          }
        })
        // console.log('dataActivationsArr',dataActivationsArr)
        setActivations(dataActivationsArr)
      } else {
        //alert('Not Upgrade')
        console.log('Not Upgrade', dataType)
        setActivations(res[0])
      }
      setIsLoading(false)
    }).catch(e => {
      //alert('not promise'+e.request._response)
      console.log('not promise', e)
      setIsLoading(false)
    })
  };

  const getActBalance = () => {
    let user_balance_id = userReducer.id
    if (dataType == 'Upgrade') {
      user_balance_id = dataForm.id
    }

    const promise2 = new Promise((resolve, reject) => {
      Axios.get(Config.API_ACTV_BALANCE + `${user_balance_id}`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Accept': 'application/json'
        }
      })
        .then((result) => {
          //alert('getActBalance')
          console.log('getActBalance', result.data.data)
          //setActBalance(result.data.data)
          resolve(result.data.data);
          // getAgen()
        }).catch((e) => {
          alert('koneksi error, mohon buka ulang aplikasinya' + e.request._response)
          reject(e);
          console.log(e);
          // BackHandler.exitApp()
        })
    })
    return promise2;
  }

  const apiActivations = () => {
    let min_type = 1
    const promise = new Promise((resolve, reject) => {
      Axios.get(Config.API_ACTIVATION_TYPE + `?min=${min_type}`,
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            'Accept': 'application/json'
          }
        }).then((result) => {
          //alert('apiActivations')
          resolve(result.data.data);
          console.log('API_ACTIVATION_TYPE', result.data.data)
        }, (err) => {
          reject(err);
        })
    })
    return promise;
  }

  const quantity = (harga, bvv, weight, type, cart) => {
    console.log('cartReducer cqty', cartReducer)
    if (type === 'MIN') {
      let totale = cartReducer.total - harga
      setTotal(totale);
      if (totale <= 0) {
        setTotal(0);
      }
      let bve = cartReducer.bv - bvv
      setBv(bve);
      if (bve <= 0) {
        setBv(0);
      }
    } else if (type === 'PLUSH') {
      let totale = cartReducer.total + harga
      setTotal(totale);
      if (totale <= 0) {
        setTotal(0);
      }
      let bve = cartReducer.bv + bvv
      setBv(bve);
      if (bve <= 0) {
        setBv(0);
      }
    }
    console.log('cart', cart)
    dispatch(change_to_package_qty(cart.qty, cart.id, harga, bvv, weight, type));
    setCartState(cartReducer);
  };

  // const tampil = () => {
  //   console.log(cartState);
  // };

  //delete item
  const deleteItem = (id, hargaTotal) => {
    console.log('cartReducer awal del', cartReducer)
    dispatch(delete_package(id));
    setCartState(cartReducer);
    setTotal(cartReducer.total);
    setBv(cartReducer.bv);
    forceUpdate();
    console.log('cartReducer del', cartReducer)
  };

  // delete all item 
  const deleteAll = () => {
    console.log('cartReducer awal del all', cartReducer)
    dispatch(delete_package_all());
    // alert('asasasasasasas')
    setCartState(cartReducer);
    setTotal(cartReducer.total);
    setBv(cartReducer.bv);
    setIsSelected(false);
    forceUpdate();
    console.log('cartReducer del all', cartReducer)
  };

  //memilih semua keranjang
  const checkAll = () => {
    var trueFalse;
    if (isSelected === false) {
      trueFalse = true;
    } else {
      trueFalse = false;
    }
    dispatch(selected_package(null, trueFalse));
  };

  const actionTokenize = () => {
    let trs_type = 'ro'
    if (dataType == 'Jaringan') {
      trs_type = 'activation'
    }
    if (dataType == 'Upgrade') {
      trs_type = 'upgrade'
    }
    let dataTokenize = {};
    dataTokenize.agent_id = userReducer.id;
    dataTokenize.customer_id = 0;
    dataTokenize.type = trs_type;
    dataTokenize.activation_type_id = activationType;
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
          navigation.navigate('NotifAlert', { notif: res.data.message + ' TOKEN: ' +  res.data.token})
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
        <Text style={styles.textKeranjang}>Pilih Tipe:</Text>
        {activations.map((item) => {
          let nama_paket = item.name
          nama_paket = nama_paket.charAt(0).toUpperCase() + nama_paket.slice(1);
          let bv_min = item.bv_min * 1000
          return (
            <View style={styles.boxRadio}>
              <View style={{ width: '10%' }} >
                <RadioButton
                  value={item.name}
                  status={checked === item.name ? 'checked' : 'unchecked'}
                  onPress={() => checkBvmin(bv_min, item.id, setChecked(item.name))}
                />
              </View>
              <View style={{ width: '90%' }} >
                <Text style={{ textAlign: 'left', paddingTop: 10 }}>Paket {nama_paket} ({item.id != 4 ? item.bv_min + ' - ' + item.bv_max : 'min ' + Numformat(item.bv_min)} bv)</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.contentHeader}>
        <Text style={styles.textKeranjang}>Keranjang Paket:</Text>
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
                quantity(cart.harga, cart.bv, cart.weight, 'MIN', cart);
              }}
              btnPlush={() => {
                quantity(cart.harga, cart.bv, cart.weight, 'PLUSH', cart);
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
          <Text style={styles.textTotal}>{Rupiah(total)}</Text>
          <Text style={styles.hargaTotal}>({Numformat(bv / 1000)} bv)</Text>
        </View>
        <ButtonCustom
          name='Tambah'
          width='30%'
          color={colors.btn_primary}
          func={() => { navigation.navigate('Products', { dataForm: dataForm, dataType: dataType, activation_type_id: activationType }) }}
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
          bvmin > bv ?
            (
              <ButtonCustom
                name='Token'
                width='30%'
                color={colors.disable}
                func={() => alert('BV kurang atau masih dibawah batasan minimum.')}
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

export default Package;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  boxRadio: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contentHeader: {
    paddingHorizontal: 20,
    marginTop: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.disable,
  },
  textKeranjang: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold'
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
    borderColor: '#ff781f',
    backgroundColor: '#ff781f',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
