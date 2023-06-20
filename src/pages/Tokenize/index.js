import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Modal, TouchableHighlight } from 'react-native'
import { TextInput } from 'react-native-gesture-handler';
import { ButtonCustom, Header, Header2, HeaderComponent, Releoder } from '../../component';
import { colors } from '../../utils/colors';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Rupiah } from '../../helper/Rupiah';
import { useSelector } from 'react-redux';
import Axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert } from 'react-native';
import Config from 'react-native-config';
import { Input } from '../../component/Input';

const ItemTrs = ({ item, onPress, style }) => (
      <TouchableOpacity style={[styles.btnTambahTrs, style]} onPress={onPress}>
            <Icon name="credit-card" color={colors.default} size={20} />
            <Text style={styles.textTambahKartu}>
                  {item.name}
            </Text>
      </TouchableOpacity>
);

const Tokenize = ({ navigation }) => {

      const [trs, setTrs] = useState('')
      const [memo, setMemo] = useState('')
      const [selectedId, setSelectedId] = useState(null);
      const [selectedTrs, setSelectedTrs] = useState(null);
      var borderColor = '#fbf6f0';
      const [nominal, setNominal] = useState(0);
      const userReducer = useSelector((state) => state.UserReducer);
      const [point, setPoint] = useState(0)
      const TOKEN = useSelector((state) => state.TokenApi);
      const [isLoading, setIsLoading] = useState(true)
      const [modalVisible, setModalVisible] = useState(false);
      const [codeOTP, setCodeOTP] = useState('');
      const [code, setCode] = useState('');
      const [listTrs, setListTrs] = useState([
            {
                  id: 1,
                  name: 'Aktivasi',
                  value: 'activation'
            },
            // {
            //       id: 2,
            //       name: 'Upgrade',
            //       value: 'upgrade'
            // },
            {
                  id: 3,
                  name: 'Repeat Order',
                  value: 'ro'
            }
      ])

      const renderListTrs = ({ item }) => {
            borderColor = item.id === selectedTrs ? '#ff781f' : '#fbf6f0';

            return (
                  <ItemTrs
                        item={item}
                        onPress={() => {
                              setSelectedTrs(item.id);
                              // setTypeTransfer(item);
                        }}
                        style={{ borderColor }}
                  />
            );
      };


      const dateRegister = () => {
            var todayTime = new Date();
            var month = todayTime.getMonth() + 1;
            var day = todayTime.getDate();
            var year = todayTime.getFullYear();
            return year + "-" + month + "-" + day;
      }

      let dataTokenize = {
            register: dateRegister(),
            customers_id: userReducer.id,
            amount: nominal,
            trs_name: selectedTrs,
            memo: memo
      }

      const actionTokenize = () => {
            console.log('dataTokenize', dataTokenize)
            if (memo != '' && selectedTrs > 0) {
                  if (dataTokenize.trs_name == '1') {
                        navigation.navigate('Package', { dataForm: { activation_type_id: 0, id: 0, memo: memo }, dataType: 'Jaringan' })
                  }
                  if (dataTokenize.trs_name == '2') {
                        //navigate to pilihan type member lama
                  }
                  if (dataTokenize.trs_name == '3') {
                        //navigate to ro
                        navigation.navigate('RO', { dataForm: { activation_type_id: 0, id: 0, memo: memo }, dataType: 'Checkout' })
                  }
            } else {
                  alert('Memo tidak boleh kosong atau Jenis Transaksi belum dipilih!')
            }
      }


      useEffect(() => {
            setIsLoading(false)
      }, [])


      if (isLoading) {
            return (
                  <Releoder />
            )
      }

      return (
            <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
                  <Header2 title='Generate Token' btn={() => navigation.goBack()} />
                  <View><Text style={styles.textTransferTrs}> </Text></View>
                  <View style={{ flex: 1 }}>
                        <FlatList
                              style={{ width: '100%', paddingHorizontal: 20 }}
                              nestedScrollEnabled
                              data={['filter', 'list2']}
                              keyExtractor={(data) => data}
                              renderItem={({ item, index }) => {
                                    switch (index) {
                                          case 0:
                                                return (
                                                      <View style={styles.infoTopUp}>
                                                            <View style={styles.boxPilihBank}>
                                                                  <Text style={styles.txtPilihBank}>Memo</Text>
                                                                  <Input
                                                                        placeholder='Memo'
                                                                        value={memo}
                                                                        multiline={true}
                                                                        numberOfLines={4}
                                                                        onChangeText={(item) => setMemo(item)}
                                                                  />
                                                            </View>
                                                      </View>
                                                );
                                          case 1:
                                                return (
                                                      <View style={styles.infoTopUp}><Text style={styles.txtNominal}></Text>
                                                            <View style={styles.contentTransfer}>
                                                                  <Text style={styles.textTransferTrs}>Pilih Transaksi</Text>
                                                                  <View style={styles.boxBtnTambahKartuAtm}>
                                                                        <FlatList
                                                                              data={listTrs}
                                                                              renderItem={renderListTrs}
                                                                              keyExtractor={(item) => item.id}
                                                                              extraData={selectedTrs}
                                                                              numColumns={2}
                                                                              contentContainerStyle={{
                                                                                    flexGrow: 1,
                                                                                    alignItems: 'center',
                                                                              }}
                                                                        />
                                                                  </View>
                                                            </View>
                                                      </View>
                                                );
                                          default:
                                                return null;
                                    }
                              }}
                        />
                  </View>
                  <View style={{ height: 60, paddingHorizontal: 20 }}>
                        <View style={styles.footer}>
                              {selectedTrs != null && memo !='' ? (
                                    <ButtonCustom
                                          name='Lanjut Proses'
                                          width='100%'
                                          color={colors.btn}
                                          func={() => Alert.alert(
                                                'Peringatan',
                                                `Lanjut Proses ? `,
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
                              ) : (
                                    <ButtonCustom
                                          name='Tokenize'
                                          width='100%'
                                          color={colors.disable}
                                          func={() => { alert('Data Anda Tidak Lengkap') }}
                                    />
                              )}
                        </View>
                  </View>
            </SafeAreaView>
      )
}

export default Tokenize

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: '#ffffff'
      },
      content: {
            padding: 20
      },
      title: {
            fontFamily: 'Roboto',
            textAlign: 'center',
            fontSize: 25,
            borderBottomColor: colors.dark,
            fontWeight: 'bold'
      },
      titlenominal: {
            fontFamily: 'Roboto',
            textAlign: 'center',
            fontSize: 15,
            borderBottomColor: colors.dark,
            // borderBottomWidth : 1
      },
      boxPilihTrs: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 20,
            // justifyContent : 'space-between'
      },
      txtPilihTrs: {
            marginRight: 20,
            fontSize: 15
      },
      inputRek: {
            marginLeft: 15,
            width: 250,
            borderBottomWidth: 1,
            borderRadius: 5,
            height: 40,
            letterSpacing: 1,
            backgroundColor: '#ffffff',
            fontSize: 16
      },
      txtNominal: {
            marginTop: 20,
            fontSize: 20,
            marginBottom: 10
      },
      boxBtnTambahKartuAtm: {
            flexDirection: 'row',
            justifyContent: 'space-between',
      },
      btnNominal: {
            borderWidth: 2,
            padding: 10,
            borderRadius: 50,
            borderColor: '#fbf6f0',
            marginHorizontal: 5,
      },
      contentNominalTopUp: {
            backgroundColor: '#ffffff',
            marginTop: 10,
            padding: 20,
      },
      textAtauMasukanNominal: {
            marginTop: 10,
            color: colors.dark,
      },
      textInputNominal: {
            borderWidth: 1,
            borderRadius: 10,
            backgroundColor: '#fbf6f0',
            borderColor: '#fbf6f0',
            marginBottom: 10,
            padding: 10,
      },
      btnTokenize: {
            borderWidth: 1,
            padding: 10,
            borderRadius: 10,
            width: 250,
            alignItems: 'center',
            backgroundColor: '#ff781f',
            borderColor: '#ff781f',
            shadowColor: "#000",
            shadowOffset: {
                  width: 0,
                  height: 1,
            },
            shadowOpacity: 0.18,
            shadowRadius: 1.00,

            elevation: 1,
            width: 350,
            height: 45
      },
      footer: {
            alignItems: 'center',
      },
      txtBtnDraw: {
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: 18
      },
      modalView: {
            marginHorizontal: 20,
            backgroundColor: "white",
            height: 300,
            marginTop: '60%',
            borderRadius: 20,
            padding: 35,
            // alignItems: "center",
            shadowColor: "#000",
            shadowOffset: {
                  width: 0,
                  height: 2
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
      },
      btnTambahTrs: {
            alignItems: 'center',
            borderWidth: 2,
            paddingVertical: 30,
            borderRadius: 10,
            paddingHorizontal: 25,
            borderColor: colors.default,
            backgroundColor: '#fbf6f0',
            marginVertical: 12,
            marginHorizontal: 10,
            width: 160,
            // textAlign : 'center'
            // alignItems : 'center'
      },
      textTambahKartu: {
            marginTop: 10,
            color: colors.dark,
            textAlign: 'center',
      },
})
