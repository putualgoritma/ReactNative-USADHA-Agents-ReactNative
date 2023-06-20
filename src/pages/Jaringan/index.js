import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { FlatList, ScrollView, TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { ButtonCustom, Header, NotifAlert, Releoder } from '../../component';
import Icon from 'react-native-vector-icons/FontAwesome';
import { colors } from '../../utils/colors';
import Axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { Input } from '../../component/Input';
import { SafeAreaView } from 'react-native-safe-area-context';
import Config from 'react-native-config';
import { useIsFocused } from '@react-navigation/native';


var colorbtn = colors.disable
const Jaringan = ({ navigation, route }) => {
  const TOKEN = useSelector((state) => state.TokenApi);
  const userReducer = useSelector((state) => state.UserReducer);
  const [loading, setLoading] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [transferTo, setTransferTo] = useState('');
  const isFocused = useIsFocused();
  const dateRegister = () => {
    var todayTime = new Date();
    var month = todayTime.getMonth() + 1;
    var day = todayTime.getDate();
    var year = todayTime.getFullYear();
    return year + "-" + month + "-" + day;
  }

  const [form, setForm] = useState({
    register: dateRegister(),
    password: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    referal_id: userReducer.id,
    package_id: '',
    agents_id: '',
    customer_id: '',
  })

  const onInputChange = (input, value) => {
    setForm({
      ...form,
      [input]: value,
    });
  };


  if (form.address != '' && form.name != '' && form.phone != '' && confirm != '' && form.password != '' && form.email != '') {
    colorbtn = colors.btn
  }

  useEffect(() => {
    if (route.params) {
      onInputChange('customer_id', route.params.dataScan)
      Axios.post(Config.API_MEMBER_SHOW_ID, { id: route.params.dataScan },
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            'Accept': 'application/json',
            'content-type': 'application/json'
          }
        }
      ).then((result) => {
        setForm({
          ...form,
          register: dateRegister(),
          name: 'Agent ' + result.data.data.name,
          address: result.data.data.address,
          customer_id: result.data.data.id,
        });
        setTransferTo(result.data.data.code + ' - ' + result.data.data.name)
        setLoading(false)
        console.log('result.data', result.data.data)
      }).catch((e) => {
        console.log(e)
        navigation.navigate('MenuScan');
      })
    }
  }, [isFocused])

  const actionJaringan = () => {
    console.log('form ' + form);
    setLoading(true)
    Axios.post(Config.API_REG_DOWNLINE, form,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Accept': 'application/json'
        }
      }
    ).then((result) => {
      if (result.data.success == true) {
        navigation.navigate('NotifAlert', { notif: 'Permohonan Registrasi Downline UBB Mart sedang diproses.' });
      } else {
        alert(result.data.message)
      }
      setLoading(false)
      // navigation.navigate('Bank');
    }).catch((error) => {
      console.log('error ' + error.request._response);
      setLoading(false)
      alert('Request Join Gagal, nomor email/telfon sudah terpakai.')
    });
  }

  if (loading) {
    return (
      <Releoder />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView>
        <View style={styles.form}>
          <Text style={styles.textTitle}>Pendaftaran Downline</Text>
          <View style={{ flexDirection: 'row' }}>
            <TextInput editable={false} placeholder='Member yang dituju' style={styles.search} value={transferTo}  ></TextInput>
            <ButtonCustom
              name='Cari'
              width='40%'
              color={colors.btn}
              func={() => { navigation.navigate('Members', { redirect: 'jaringan' }) }}
              height={50}
            />
          </View>
          <View style={{ marginBottom: 70 }}>
            {/* <View style={styles.login}>
                    <Text style={styles.textLogin}> ayo buruan gabung </Text>
                  </View> */}
            <Input
              placeholder='Password'
              title="Password"
              secureTextEntry={true}
              value={form.password}
              onChangeText={(value) => onInputChange('password', value)}
            />
            <Input
              placeholder='Confirm Password'
              title="Confirm Password"
              secureTextEntry={true}
              value={form.confirmPassword}
              onChangeText={(value) => setConfirm(value)}
            />
            <Input
              placeholder='Name'
              title="Name"
              value={form.name}
              onChangeText={(value) => onInputChange('name', value)}
            />
            <Input
              placeholder='Phone Number'
              title="Phone Number"
              keyboardType="numeric"
              value={form.phone}
              onChangeText={(value) => onInputChange('phone', value)}
            />
            <Input
              placeholder='Email'
              title="Email"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(value) => onInputChange('email', value)}
            />
            <Input
              placeholder='Address'
              title="Adrres"
              multiline={true}
              // numberOfLines={4}
              value={form.address}
              onChangeText={(value) => onInputChange('address', value)}
            />
            <View style={{ marginTop: 20, alignItems: 'center', justifyContent: 'center' }}>
              {/* <FlatList
                      data={item1}
                      renderItem={renderItem}
                      keyExtractor={(item) => item.id.toString()}
                      extraData={selectedId}
                      // numColumns={2}
                      // contentContainerStyle={{
                      //   flexGrow: 1,
                      //   alignItems: 'center',
                      // }}
                    /> */}
              {form.address != '' && form.name != '' && form.phone != '' && confirm != '' && form.password != '' && form.email != '' && form.customer_id != '' ?
                form.password == confirm ? (
                  <ButtonCustom
                    name='Selanjutnya'
                    width='100%'
                    color={colors.btn}
                    func={() => actionJaringan()}
                  />
                ) : (
                  <ButtonCustom
                    name='Selanjutnya'
                    width='100%'
                    color={colors.btn}
                    func={() => alert('Password tidak sama')}
                  />
                )
                : (
                  <ButtonCustom
                    name='Selanjutnya'
                    width='100%'
                    color={colors.disable}
                    func={() => alert('Mohon lengkapi data anda')}
                  />
                )}
            </View>
          </View>
          {/* );
                  } */}
        </View>
      </ScrollView>
    </SafeAreaView  >
  );
};

export default Jaringan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // flexDirection: 'column',
    backgroundColor: '#ffffff',
    paddingBottom: 10,
  },
  form: {
    paddingHorizontal: 30,
    marginTop: 25,
  },
  textTitle: {
    textAlign: 'center',
    fontSize: 25,
    marginBottom: 10,
  },
  login: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'center',
  },
  textLogin: {
    letterSpacing: 2,
    color: colors.dark,
  },
  textMasuk: {
    color: colors.default,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  titlelabel: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  selectPicker: {
    marginVertical: 10,
  },
  pickerBorder: {
    borderBottomWidth: 1,
    borderColor: colors.default,
    marginVertical: 20,
  },
  containerPicker: {
    marginHorizontal: 30,
  },
  textBank: {
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  textInput: {
    borderBottomWidth: 1,
    paddingVertical: 15,
    borderColor: colors.default,
  },
  containerInput: {
    marginBottom: 20,
  },
  titlelabel: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  box: {
    marginBottom: 10
  },
  agen: {
    padding: 10,
    marginBottom: 10,
    borderWidth: 3,
    // borderColor : colors.disable,
    borderRadius: 5,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 1,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,

    // elevation: 0,
  },
  pilihPaket: {
    marginBottom: 5
  },
  borderLogin: {
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: colors.btn,
    borderColor: colors.btn,
    shadowColor: '#000',
  },
  borderLogin1: {
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: colors.btn,
    borderColor: colors.btn,
    shadowColor: '#000',
  },
  textBtnLogin: {
    color: '#ffffff',
    fontSize: 18,
  },
  header: {
    backgroundColor: colors.default,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  textHeader: {
    fontSize: 20,
    color: '#39311d',
    fontWeight: 'bold',
  },
  bell: {
    fontSize: 20,
    color: 'white',
  },
  // D:\dev\RNTest\node_modules\@react-native-picker\picker\windows\ReactNativePicker\ReactNativePicker.vcxproj
});
