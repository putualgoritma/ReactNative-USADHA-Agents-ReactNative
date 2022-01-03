import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import { useIsFocused } from '@react-navigation/native';
import Axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Alert, BackHandler, FlatList, Image, PermissionsAndroid, StyleSheet, Text, View } from 'react-native';
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import Config from 'react-native-config';
import {
  ScrollView,
  TextInput,
  TouchableOpacity
} from 'react-native-gesture-handler';
import MapView, { Marker } from 'react-native-maps';
import QRCode from 'react-native-qrcode-svg';
import Select2 from 'react-native-select-two';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from 'react-redux';
import { profile } from '../../assets';
import { ButtonCustom, HeaderComponent, Releoder } from '../../component';
import { Rupiah } from '../../helper/Rupiah';
import { colors } from '../../utils/colors';
function useForceUpdate() {
  const [refresh, setRefresh] = useState(0); // integer state
  return () => setRefresh((refresh) => ++refresh); // update the state to force render
}
import { renameKey } from '../../utils';

const ItemAGen = ({ item, onPress, style }) => (
 <View>
    <TouchableOpacity onPress={onPress} style={[styles.item, style,  styles.agen]}>
      <Text style={styles.textName}>{item.name}</Text>
        <View style={{flexDirection : 'row', alignItems:'center'}}>
          <Image source={{uri: Config.BASE_URL + `${item.img}`}} style={{width : 80, height: 80, borderWidth:1, marginRight:20, marginBottom : 10}}/>
          {/* <Image style={{width : 80, height: 80, borderWidth:1, marginRight:20, marginBottom : 10}} source={profile}></Image> */}
          <Text style={{width : '70%'}}>{item.description}</Text>
        </View>
      <Text style={{fontSize : 15, letterSpacing : 1, fontWeight : 'bold'}}> {Rupiah(parseInt(item.price))}</Text>
    </TouchableOpacity>
 </View>
);


const Input = ({title,placeholder ='', ...rest}) => {
  // const userReducer = useSelector((state) => state.UserReducer.data);
  return (
    <View>
      <Text style={styles.textUsername}>{title}</Text>
      <TextInput style={styles.inputUsername} {...rest} placeholder = {placeholder}  />
    </View>
  );
};

const Profile = ({navigation}) => {
  const userReducer = useSelector((state) => state.UserReducer);
  const [form, setForm] = useState(userReducer);
  // console.log(userReducer);
  const dispatch = useDispatch();  
  const TOKEN = useSelector((state) => state.TokenApi);
  const [loading, setLoading] = useState(true);
  const [paket, setPaket] = useState(null)
  const [point, setPoint] = useState (0)
  const [selectedId, setSelectedId] = useState(null);
  const isFocused = useIsFocused();
  var data1 = [
    {label: '---', value: null, icon: () => <Icon name="flag" size={18} color="#900" />}
  ]
  const [enableLocation, setEnableLocation] = useState()
  const [agen,setAgen] = useState(data1)
  const forceUpdate = useForceUpdate();
  const [item1, setItem1] = useState(null);
  const [status, setStatus] = useState(form.status)
  const [password, setPassword] = useState(null)
  const [provinces, setProvinces] = useState(null)
  const [cities, setCities] = useState(null)
  const [oldCities, setOldCities] = useState(null)
  const [confirmPassword, setConfirmPassword] = useState(null)
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null
  })  
  let dataUpdate = {
    id : '',
    name : '',
    phone : '',
    email : '',
    // password : '',
    address : '',
    lat :'',
    lng : '',
    province_id : '',
    city_id : ''
  }
  const getMapRegion = () => ({
    latitude: form.lat,
    longitude:form.lng,
    latitudeDelta: 0.0022,
    longitudeDelta:0.0121
  });
  useEffect(() => {
    if(isFocused){
      LocationServicesDialogBox.checkLocationServicesIsEnabled({
        message: "<h2 style='color: #0af13e'>Use Location ?</h2>This app wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location<br/><br/><a href='#'>Learn more</a>",
        ok: "YES",
        cancel: "NO",
      }).then(succes => {
        Promise.all([getPaket(), requestLocationPermission(), locationApi()]).then(res => {
          // console.log('dataa',res)
            Geo().then(loc => {
                setLocation({
                  latitude: loc.coords.latitude,
                  longitude: loc.coords.longitude, 
                })
                // console.log('latitude',loc.coords.latitude);
                // console.log('longitude',loc.coords.longitude);
                setLoading(false)
            }).catch(err => {
              setLocation({
                latitude:0.00000000,
                longitude: 0.00000000, 
              })
                Alert.alert('Error', JSON.stringify(err))
                setLoading(false)
            })
        }).catch((e) => {
          console.log(e);
        })
      }).catch((e) => {
        console.log(e.message) ;
        setLoading(false)
      })
    }
  }, [isFocused])

  useEffect(() => {
    filterCity(userReducer.province_id)
  }, [oldCities])

  const Geo =() => {
    const promiseGeo = new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition((position) => {
          resolve(position)
      },
          error => reject(error) ,
        { enableHighAccuracy: true, timeout: 200000, maximumAge: 1000 },
      );
    });
    return promiseGeo
  }
 


  const requestLocationPermission =  async () => {
    let info ='';
    try {
        const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            'title': 'Location Permission',
            'message': 'MyMapApp needs access to your location'
          }
        )

       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setEnableLocation(true)
       } else {
          setEnableLocation(false)
       }
    } catch (err) {
        info=1
    }

    return enableLocation
  }

  const locationApi = () => {
    Axios.get('http://admin.belogherbal.com/api/open/location', {
      headers : {
        'Accept' : 'application/json'
      }
    }).then((result) => {
      // console.log(result);
      result.data.province.forEach(obj => {renameKey(obj, 'title', 'name')});
      result.data.city.forEach(obj => {renameKey(obj, 'title', 'name')});
      setProvinces( result.data.province)
      setOldCities(result.data.city)
    }).catch((e) => {
      console.log('location', e);
    })
  }

  const filterCity = (id) => {
    let data = []
    if(oldCities){
      oldCities.map((item, index) => {
        if(item.province_id == id){
          data[index] = item
        }
      })
    }

    setCities(data)
  }

  const getPaket = () => {
    Axios.get(Config.API_PACKAGES_AGENT, 
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Accept' : 'application/json' 
        }
      }
    ).then((result) => {
      setItem1(result.data.data)
      getPoint()
    }).catch((error) => {
      console.log('error ' + error);
      alert('koneksi error, mohon buka ulang aplikasinya')
      BackHandler.exitApp()
    });

    return 0;
    // console.log('jajajajajajaj')
  }

  const getAgen =() => {
    Axios.get(Config.API_AGENTS , 
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Accept' : 'application/json' 
        }
      }
    ).then((result) => {
      result.data.map((data, index) => {
        data1[data1.length] = {
          label: data.name,
          value: data.id,
          icon: () => <Icon name="user" size={18} color="#900" />,
        };
      });
      setAgen(data1)
      setLoading(false);
    }).catch(() => {
      alert('koneksi error, mohon buka ulang aplikasinya')
      BackHandler.exitApp()
    })
  }

  const onInputChange = (input, value) => {
    setForm({
      ...form,
      [input]: value,
    });
    // console.log(form.name)
  };

  const resetLocation=()=>{
    // alert('hallo');
    setForm({
      ...form,
      lat : location.latitude,
      lng : location.longitude
  })
  };
  

  const updateData = () => {
    dataUpdate.name = form.name
    dataUpdate.address = form.address
    dataUpdate.password = password
    dataUpdate.phone = form.phone
    dataUpdate.email = form.email
    dataUpdate.id = form.id
    dataUpdate.lng = form.lng == 0.00000000 ? location.longitude : form.lng
    dataUpdate.lat = form.lat == 0.00000000 ? location.latitude : form.lat
    dataUpdate.province_id = form.province_id
    dataUpdate.city_id = form.city_id
    setLoading(true)
    if(password !== null ) {
     if(password === confirmPassword){
        Axios.post(Config.API_UPDATE_PROFILE, dataUpdate,
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            'Accept' : 'application/json' 
          }
        }
        ).then((result) => {
          console.log('data profile',result.data)
          setForm(result.data.data)
          storeDataUser(result.data.data)
          dispatch({type: 'SET_DATA_USER', value: result.data.data});
          setPassword(null)
          setLoading(false)
          navigation.navigate('NotifAlert', {notif : 'Update Profile Berhasil'})
        }).catch((error) => {
          console.log('error ' + error);
          alert('Gagal Update Profile')
          setLoading(false)
        });
     }else{
        alert('password tidak sama')
        setLoading(false)
     }
    }else{
      alert('mohon isi password')
      setLoading(false)
    }

    // console.log('data form',form)
    // console.log('data form',TOKEN)
    // console.log('data profile',)
  };


  const storeDataUser = async (value) => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem('@LocalUser', jsonValue)
    } catch (e) {
      console.log('Token not Save')
    }
  }


  const getPoint = () => {
    Axios.get(Config.API_POINT + `${userReducer.id}`, {
      headers : {
        Authorization: `Bearer ${TOKEN}`,
        'Accept' : 'application/json' 
      }
    })
    .then((result) => {
      // console.log('data point api', result.data.data[0].balance_points)
      setPoint(parseInt(result.data.data[0].balance_points))
      getAgen()
    }).catch(() => {
      alert('koneksi error, mohon buka ulang aplikasinya')
      BackHandler.exitApp()
    })
  }
  const activasi = () => {
    setLoading(true)
    if(paket !=null){
        if(point < parseInt(paket.price)){
          setLoading(false)
          alert('Point Anda Kurang silahkan Top Up dulu')
        }else{
          var dataActivasi = {
            id : form.id,
            package_id : paket.id,
            // agents_id : dataAgen
          }
          // console.log(dataActivasi)
          Axios.post(Config.API_ACTIVE_AGENT, dataActivasi,
            {
              headers: {
                Authorization: `Bearer ${TOKEN}`,
                'Accept' : 'application/json' 
              }
            }
          ).then((result) => {
            setStatus('active')
            // alert('sukses activasi member')
            const dataUser = {
              ...form,
              status : 'active'
            }
            
            dispatch({type : 'SET_DATA_USER', value:dataUser}); 
            storeDataUser(dataUser);
            setForm(dataUser)
            // forceUpdate();
            setLoading(false)
            navigation.navigate('NotifAlert', {notif: 'Sukses Activasi Agen'})
          }).catch((error) => {
            // console.log(error.request._response.message);
            var mes = JSON.parse(error.request._response);
            alert(mes.message)
            setLoading(false)
          });
        }
    }else{
      setLoading(false)
      alert('pilih paket yang anda inginkan dahulu')
    }
    forceUpdate();
    // console.log(dataActivasi)
  }
  const renderItem = ({ item }) => {
    const borderColor = item.id === selectedId ? colors.btn : colors.disable;

    return (
      <ItemAGen
        item={item}
        onPress={() => {setSelectedId(item.id);setPaket(item);}}
        style={{ borderColor }}
      />
    );
  };

  if(loading){
    return (
      <Releoder/>
    )
  }

  if(form.status == 'pending' || form.status =='close'){
    return (
    <View style={styles.container}>
     <HeaderComponent/>
      <View style={styles.body}>
        <View style={styles.info}>
          <Text style={styles.label}>Nama  :</Text>
          <Text style={styles.isi}>{form.name}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.label}>Email   :</Text>
          <Text style={styles.isi}>{form.email}</Text>
        </View>
        {/* <DropDownPicker
          items={agen}
          defaultValue={null}
          containerStyle={{height: 40}}
          style={{backgroundColor: '#fafafa'}}
          itemStyle={{
              justifyContent: 'flex-start'
          }}
          dropDownStyle={{backgroundColor: '#fafafa'}}
          onChangeItem={item =>setDataAgen(item.value)}
        /> */}
        <FlatList
          style={{width: '100%'}}
          nestedScrollEnabled
          data={['filter', 'title1', 'list1', 'title2', 'list2']}
          keyExtractor={(data) => data}
          renderItem={({item, index}) => {
            switch (index) {
              case 0:
                return (
                  <View style={{marginTop : 20}}>
                    <Text style={styles.pilihPaket} >Pilih Paket</Text>
                    <FlatList
                      data={item1}
                      renderItem={renderItem}
                      keyExtractor={(item) => item.id.toString()}
                      extraData={selectedId}
                    />
           
                  </View>
                );
              default:
                return null;
            }
          }}
        />
         <View style={{alignItems : 'center', justifyContent : 'center', marginTop : 10, marginBottom:30}}>
            <ButtonCustom
              name = 'Activasi Sekarang'
              width = '100%'
              color = {colors.btn}
              // func = {() => {activasi()}}
              func = {() => Alert.alert(
                  'Peringatan',
                  `Ingin Activasi sekarang ? `,
                  [
                      {
                          text : 'Tidak',
                          onPress : () => console.log('tidak')
                      },
                      {
                          text : 'Ya',
                          onPress : () => activasi()
                      }
                  ]
              )}
            />
        </View>
      </View>
    </View>
    )
  } else {
    return (
      <View style={styles.container}>
        <HeaderComponent/>
        <ScrollView>
          {/* update profile */}
          <View style={{backgroundColor: '#ffffff', padding: 20}}>
            
            <View style={{alignItems: 'center'}}>
              <QRCode
                value={form.phone}
            />
            </View>
            <Text style={{fontSize: 18, fontWeight: 'bold'}}>Edit Profile</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
              }}>
              {form.img == null || form.img == '' ?  
                <Image
                    source={profile}
                  style={{height: 50, width: 50, marginRight: 20}}
                /> : 
                <Image
                source = {{uri : Config.BASE_URL + `${form.img}?time="` + new Date()}}
                style={{height: 50, width: 50, marginRight: 20}}
                />
              }
              <TouchableOpacity onPress={() => navigation.navigate('UploadImg')}>
                <Text style={{fontSize: 15, color: '#03c4a1'}}>
                  Perbarui Foto Profile
                </Text>
              </TouchableOpacity>
            </View>
            <Input
              title="Nama Lengkap"
              value={form.name}
              onChangeText={(value) => onInputChange('name', value)}
            />
            <Input
              title="Password"
              secureTextEntry={true}
              value={password}
              onChangeText={(value) => setPassword(value)}
              placeholder = '***********'
            />
            <Input
              title="Confirm Password"
              secureTextEntry={true}
              value={confirmPassword}
              onChangeText={(value) => setConfirmPassword(value)}
              placeholder = '***********'
            />
            <Input
              title="Email"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(value) => onInputChange('email', value)}
            />
            <Input
              title="Phone Number"
              keyboardType="numeric"
              value={form.phone}
              onChangeText={(value) => onInputChange('phone', value)}
            />
              <Text>Provinsi</Text>
            {provinces &&
              <Select2
              isSelectSingle
              style={{ borderRadius: 5 }}
              searchPlaceHolderText='Seacrh Province'
              colorTheme={colors.default}
              popupTitle="Select Province"
              // title={form.provinces.title}
              title={form.provinces ? form.provinces.title : 'Mohon isi data Provinsi'}
              selectButtonText='select'
              cancelButtonText = 'cancel'
              data={provinces}
              onSelect={value => {
                onInputChange('province_id', value[0])
                filterCity(value[0])
              }}
              style={{borderColor :colors.default, borderTopWidth : 0, borderRightWidth : 0,  borderLeftWidth : 0,}}
              onRemoveItem={value => {
                onInputChange('province_id', value[0])
              }}
            />
            }
             <View style={{marginVertical : 10}} />
             {(cities && form.city_id !=='') &&
              <>
              <Text>Kota</Text>
              <View style={{marginVertical : 10}} />
                  <Select2
                  isSelectSingle
                  searchPlaceHolderText='Search City'
                  style={{ borderRadius: 5 }}
                  colorTheme={colors.default}
                  popupTitle="Select Province"
                  title={form.city ? form.city.title : 'Mohon isi data Kota'}
                  selectButtonText='select'
                  cancelButtonText = 'cancel'
                  data={cities}
                  onSelect={value => {
                    onInputChange('city_id', value[0])
                  }}
                  onRemoveItem={value => {
                    onInputChange('city_id', value[0])
                  }}
                  style={{borderColor :colors.default, borderTopWidth : 0, borderRightWidth : 0,  borderLeftWidth : 0,}}
                />
              </>
              }
            <Input
              title="Alamat  "
              multiline={true}
              numberOfLines={4}
              value={form.address}
              onChangeText={(value) => onInputChange('address', value)}
            />
            <Text style={styles.textUsername}>Type</Text>
            <Text style={styles.type}>{form.type}</Text>
            {/* <Text onPress={()=>console.log('database',cities)}>Database</Text> */}
         

            <View style = {{alignItems : 'center', justifyContent : 'center', marginTop : 20, flexDirection:'row'}}>
              <ButtonCustom
                name = 'Update Data'
                color = {colors.btn}
                width = '50%'
                // func = {() => updateData()}
                func = {() => Alert.alert(
                  'Peringatan',
                  `Anda akan memperbarui profile ? `,
                  [
                      {
                          text : 'Tidak',
                          onPress : () => console.log('tidak')
                      },
                      {
                          text : 'Ya',
                          onPress : () => updateData()
                      }
                  ]
                )}
              />
            
              <View style={{paddingHorizontal:5}}>
                 
              </View>
              <ButtonCustom
                name = 'Reset Koordinat'
                color = {colors.btn}
                width = '50%'
                // func = {() => updateData()}
                func = {() =>resetLocation()}
              />
            </View>
            <Text>{form.lat + ' dan ' + form.lng}</Text>
            <View style={{marginTop:40}}>
                {(location.latitude && location.longitude) &&
                   <MapView
                      style={styles.map}
                      //  provider={PROVIDER_GOOGLE}
                      // showsUserLocation
                      initialRegion={{
                        latitude: parseFloat(form.lat) == 0.00000000 ?  location.latitude : parseFloat(form.lat),
                        longitude: parseFloat(form.lng) == 0.00000000 ? location.longitude : parseFloat(form.lng),
                        latitudeDelta:0.0022,
                        longitudeDelta:0.0121}}
                        followsUserLocation={true}
                        region={getMapRegion()}
                  >
                      <Marker
                          coordinate={{latitude : (parseFloat(form.lat) == 0.00000000 ?  location.latitude : parseFloat(form.lat)), longitude:(parseFloat(form.lng) == 0.00000000 ?location.longitude : parseFloat(form.lng))}}
                          // onDragEnd={e => console.log('onDragEnd', e.nativeEvent.coordinate.latitude)}
                          onDragEnd={(e) => setForm({
                              ...form,
                              lat : e.nativeEvent.coordinate.latitude,
                              lng : e.nativeEvent.coordinate.longitude
                          })}
                          draggable
                      >
                      </Marker>
                  </MapView>
                }
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };
  }
  

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: colors.disable,
  },
  textUsername: {
    justifyContent: 'flex-start',
    color: colors.dark,
    marginTop: 10,
  },
  inputUsername: {
    borderBottomWidth: 1,
    marginTop: -10,
    color: colors.dark,
    borderBottomColor: colors.default,
    marginBottom: 20,
    fontSize: 15,
  },
  borderLogin: {
    borderWidth: 1,
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
  body : {
    paddingHorizontal : 20,
    backgroundColor : '#ffffff',
    flex : 1,
    // marginBottom : 10
  },
  info : {
    flexDirection : 'row',
    alignItems : 'center',
    marginVertical : 10,
    marginTop : 10,
  }, 
  label : {
    fontSize :  15,
    color :colors.btn,
    fontWeight : 'bold'
  },
  isi : {
    marginLeft : 30,
    fontSize : 15,
    fontWeight:'bold'
  },
  pilihPaket : {
    marginBottom : 10,
    fontSize : 20,
    color : colors.btn,
    fontWeight:'bold'
  },
  agen : {
    padding : 20,
    marginBottom : 10,
    borderWidth : 3,
    // borderColor : colors.disable,
    borderRadius : 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 0,
  }, 
  textName : {
    fontSize : 15,
    fontWeight : 'bold',
    marginBottom : 10,
    color : colors.btn
  },
  type: {
    marginTop : 10,
    borderWidth : 1,
    padding : 5,
    width : 150,
    borderRadius : 10,
    textAlign : 'center',
    backgroundColor : 'rgb(0, 230, 64)',
    borderColor : 'rgb(0, 230, 64)',
    color : '#ffffff'
  },
  map : {
    width : '100%',
    height : 300 
  }
});
