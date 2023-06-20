import React, {useState, useEffect} from 'react'
import { StyleSheet, Text, View } from 'react-native'
import {Header} from '../../component';
import { useSelector} from 'react-redux';
import Axios from 'axios';
import {Releoder} from '../../component';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ListItem, Avatar } from "react-native-elements";
import { TouchableHighlight } from "react-native";
import Config from 'react-native-config';



const Downline = () => {
      const TOKEN = useSelector((state) => state.TokenApi);
      const [data, setData] = useState(null)
      const userReducer = useSelector((state) => state.UserReducer);
      const [isLoading, setIsLoading] = useState(true)

      const getDownline = () => {
            Axios.get(Config.API_DOWNLINE +`${userReducer.id}`, 
                  {
                        headers: {
                              Authorization: `Bearer ${TOKEN}`,
                              'Accept' : 'application/json' 
                        }
                  }
            ).then((res) => {
                  console.log('API_DOWNLINE',res.data.data)
                  setData(res.data.data)
                  setIsLoading(false)
            })
      }

      useEffect(() => {
            getDownline()
      }, [])

      if (isLoading) {
            return  (
                  <Releoder/>
            )
      }

      return (
            <SafeAreaView style={styles.container}>
                  <Header/>
                  <ScrollView>
                        <View style={{padding : 20,}}>
                              <Text style={{fontSize : 20, fontWeight :'bold'}}>Downline / Mitra Langsung</Text>
                              {data.map((item, index) => {
                                    return (
                                          // <View style={{borderWidth : 1, marginTop : 20, padding : 5, borderRadius : 5, backgroundColor : '#fbf6f0', borderColor : '#fbf6f0'}} key={item.id}>
                                          //       <View style={{flexDirection : 'row'}}>
                                          //             <Text style={{marginRight : 40, fontSize : 15}}>No :</Text>
                                          //             <Text style={{fontSize : 15, textAlign : 'center', fontWeight :'bold'}}>    {index +1}</Text>
                                          //       </View>
                                          //       <View style={{flexDirection : 'row'}}>
                                          //             <Text style={{marginRight : 40, fontSize : 15}}>Code :</Text>
                                          //             <Text style={{fontSize : 15}}>{item.code}</Text>
                                          //       </View>
                                          //       <View style={{flexDirection : 'row'}}>
                                          //             <Text style={{marginRight : 35, fontSize : 15}}>Nama :</Text>
                                          //             <Text style={{fontSize : 15}}>{item.name}</Text>
                                          //       </View>
                                          //       <View style={{flexDirection : 'row'}}>
                                          //             <Text style={{marginRight : 28, fontSize : 15}}>Alamat :</Text> 
                                          //             <Text style={{fontSize : 15}}>{item.address}</Text>
                                          //       </View>
                                          // </View>
                                          <ListItem
                                                style={{marginVertical : 2}}
                                                Component={TouchableHighlight}
                                                containerStyle={{}}
                                                disabledStyle={{ opacity: 0.5 }}
                                                onLongPress={() => console.log("onLongPress()")}
                                                onPress={() => console.log("onPress()")}
                                                pad={20}
                                                bottomDivider ={true}
                                          >
                                                <Text>{index + 1}</Text>
                                                <Avatar
                                                source={{
                                                uri:
                                                      "https://avatars0.githubusercontent.com/u/32242596?s=460&u=1ea285743fc4b083f95d6ee0be2e7bb8dcfc676e&v=4"
                                                }}
                                                />
                                                <ListItem.Content>
                                                      <ListItem.Title>
                                                            <Text>{item.name}</Text>
                                                      </ListItem.Title>
                                                      <ListItem.Subtitle>
                                                            <Text>{item.code}</Text>
                                                      </ListItem.Subtitle>
                                                      <ListItem.Subtitle>
                                                            <Text>{item.address}</Text>
                                                      </ListItem.Subtitle>
                                                </ListItem.Content>
                                          </ListItem>
                                                
                                    )
                              })}
                        </View>
                  </ScrollView>
            </SafeAreaView>
      )
}

export default Downline

const styles = StyleSheet.create({
      container : {
            flex :1,
            backgroundColor : '#ffffff'
      }
})
