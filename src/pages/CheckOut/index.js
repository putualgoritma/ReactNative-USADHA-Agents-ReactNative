import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, ScrollView } from 'react-native';
import { colors } from '../../utils/colors';
import { useIsFocused } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { Rupiah } from '../../helper/Rupiah';
import Axios from 'axios';
import { check_out_keranjang, delete_cart_all } from '../../redux';
import { ButtonCustom, Header2, Releoder, Txt } from '../../component';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert } from 'react-native';
import Config from 'react-native-config';
import { RadioButton } from 'react-native-paper';
// import { Distance } from '../../utils';

const Item = (props) => {
  return (
    <View>
      <View
        style={{ marginBottom: 10, paddingHorizontal: 20, paddingVertical: 10 }}>
        <Text style={{ fontWeight: 'bold' }}>Pesanan {props.pesanan}</Text>
        <Text style={{ letterSpacing: 2 }}>Usadha Bhakti</Text>
        <View style={styles.item}>
          <Image source={props.img} style={{ width: 80, height: 80 }} />
          <View style={{ marginLeft: 10, marginBottom: 15 }}>
            <Text style={{ fontWeight: 'bold' }}>{props.name}</Text>
            <Text style={{ fontWeight: 'bold' }}>Random</Text>
            <Text style={{ color: colors.dark }}>
              {props.qty} barang (250 gr)
            </Text>
            <Text style={{ fontWeight: 'bold' }}>{Rupiah(props.harga)}</Text>
          </View>
        </View>
        <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
          <Text style={{ fontSize: 16 }}>Subtotal</Text>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
            {Rupiah(props.hargaSub)}
          </Text>
        </View>
      </View>
      <View style={{ backgroundColor: colors.disable, height: 8 }} />
    </View>
  );
};

const CheckOut = ({ navigation, route }) => {
  const userReducer = useSelector((state) => state.UserReducer);
  const [agen, setAgen] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const cartReducer = useSelector((state) => state.CartReducer);
  const isFocused = useIsFocused();
  const [cartState, setCartState] = useState(cartReducer);
  const dispatch = useDispatch();
  const TOKEN = useSelector((state) => state.TokenApi);
  var pesanan = 0;
  const dataCart = []

  useEffect(() => {
    cartState.item.map((cart) => {
      dataCart[dataCart.length] = {
        products_id: cart.id,
        price: cart.harga,
        quantity: cart.qty,
        // name : 'asasasas'
      };
    })

    setOrders({
      ...orders,
      cart: dataCart
    })
    setIsLoading(false)
  }, [isFocused]);

  const dateRegister = () => {
    var todayTime = new Date();
    var month = todayTime.getMonth() + 1;
    var day = todayTime.getDate();
    var year = todayTime.getFullYear();
    return year + "-" + month + "-" + day;
  }

  const [orders, setOrders] = useState({
    register: dateRegister(),
    customers_id: userReducer.id,
    memo: "",
    agents_id: null,
    cart: dataCart,
    payment_type: 'point',
  });

  const handleChecked = (key, value) => {
    setOrders({
      ...orders,
      [key]: value
    })
  }

  const ordersData = () => {
    // console.log('orders', orders)
    // console.log('test test test')
    setIsLoading(true)
    Axios.post(Config.API_ORDER_AGENT, orders,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Accept': 'application/json',
          'content-type': 'application/json'
        }
      }
    ).then((result) => {
      if (result.data.success == true) {
        // console.log(result.data)
        // setOrders(null);
        handleChecked('cart', null)
        dispatch(check_out_keranjang());
        // alert('Pesanan anda sedang di buat')
        navigation.navigate('NotifAlert', { notif: 'Pesanan anda Berhasil' })
      } else {
        alert('point anda kurang')
      }
      setIsLoading(false)
    }).catch((error) => {
      console.log('error ' + error.message);
      alert('pesanan gagal di buat')
      setIsLoading(false)
    });
  };

  if (isLoading) {
    return (
      <Releoder />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header2 title='Checkout' btn={() => navigation.goBack()} />
      <ScrollView>
        <View style={styles.body}>
          {cartState.item.map((cart) => {
            pesanan++;
            return (
              <Item
                name={cart.namaProduct}
                img={{ uri: Config.BASE_URL + `${cart.img}` }}
                harga={cart.harga}
                hargaSub={cart.harga * cart.qty}
                pesanan={pesanan}
                qty={cart.qty}
                key={cart.id}
              />
            );
          })}

          <View style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
              Ringkasan belanja
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 6,
              }}>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 6,
              }}>
              <Text>Sub Total Item ({cartReducer.item.length} Barang)</Text>
              <Text>{Rupiah(cartReducer.total)}</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 6,
              }}>
              <Text>Biaya Pengiriman ({cartReducer.item.length} Barang)</Text>
              <Text>{Rupiah(0)}</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 6,
              }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                Total Harga ({cartReducer.item.length} Barang)
              </Text>
              <Text style={{ fontWeight: 'bold' }}>
                {Rupiah(cartReducer.total)}
              </Text>
            </View>
          </View>

          <View style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
              Pilih Tipe Pembayaran
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <RadioButton
                value="point"
                status={orders.payment_type === 'point' ? 'checked' : 'unchecked'}
                onPress={() => handleChecked('payment_type', 'point')}
                color='#087CDB'
              />

              <Txt title="Poin" />
              <View style={{ marginVertical: 10, marginHorizontal: 10 }} />
              <RadioButton
                value="bank"
                status={orders.payment_type === 'bank' ? 'checked' : 'unchecked'}
                onPress={() => handleChecked('payment_type', 'bank')}
                color='#087CDB'
              />

              <Txt title="Bank Transfer" />

            </View>
          </View>

          <View style={{ backgroundColor: colors.disable, height: 8 }} />
          <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
            <ButtonCustom
              name='Buat Pesanan'
              width='90%'
              color={colors.btn}
              // func = {() => ordersData()}
              func={() => Alert.alert(
                'Peringatan',
                `Checkout sekarang ? `,
                [
                  {
                    text: 'Tidak',
                    onPress: () => console.log('tidak')
                  },
                  {
                    text: 'Ya',
                    onPress: () => ordersData()
                  }
                ]
              )}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CheckOut;

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
  textTopUp: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  body: {
    // paddingHorizontal : 20,
    marginBottom: 10,
  },
  item: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  borderLogin: {
    borderWidth: 1,
    marginHorizontal: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: colors.btn,
    borderColor: colors.btn,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
    marginTop: 15,
  },
  textBtnLogin: {
    color: '#ffffff',
    fontSize: 18,
  },
});
