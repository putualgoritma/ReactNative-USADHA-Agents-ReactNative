import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors } from '../../utils/colors';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Rupiah } from '../../helper/Rupiah';
import { useDispatch, useSelector } from 'react-redux';
import Axios from 'axios';
import { ButtonCustom, Header2, HeaderComponent, Releoder, SubMenu } from '../../component';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Config from 'react-native-config';
import { ScrollView } from 'react-native-gesture-handler';

const Mart = ({ navigation }) => {
    const [selectedId, setSelectedId] = useState(null);
    const [selectedIdTypeTransfer, setSelectedIdTypeTransfer] = useState(null);
    const [nominal, setNominal] = useState(0);
    const [typeTransfer, setTypeTransfer] = useState(null);
    var borderColor = '#fbf6f0';
    var backgroundColor = '#fbf6f0';
    const userReducer = useSelector((state) => state.UserReducer);
    const [display, setDisplay] = useState('flex');
    const TOKEN = useSelector((state) => state.TokenApi);
    const [point, setPoint] = useState(0)
    const [isLoading, setIsLoading] = useState(true);
    const [typeTf, setTypeTf] = useState(null)
    const [selectType, setSelectType] = useState(null)

    useEffect(() => {
        setIsLoading(false);
        console.log('userReducer', userReducer)
    }, [])


    var formJoin = {
        customer_id: userReducer.id,
    }

    const actionJoin = () => {
        setIsLoading(true)
        Axios.post(Config.API_JOIN, formJoin,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    'Accept': 'application/json'
                }
            }
        ).then((result) => {
            navigation.navigate('NotifAlert', { notif: 'Permohonan Join UBB Mart sedang diproses.' });
            setIsLoading(false)
            // navigation.navigate('Bank');
        }).catch((error) => {
            console.log('error ' + error);
            setIsLoading(false)
        });
    }

    const actionUpgrade = () => {
        setIsLoading(true)
        Axios.post(Config.API_UPGRADE, formJoin,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    'Accept': 'application/json'
                }
            }
        ).then((result) => {
            navigation.navigate('NotifAlert', { notif: 'Permohonan Upgrade UBB Mart sedang diproses.' });
            setIsLoading(false)
            // navigation.navigate('Bank');
        }).catch((error) => {
            console.log('error ' + error);
            setIsLoading(false)
        });
    }

    if (isLoading) {
        return (
            <Releoder />
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ flex: 1 }}>
                <Header2 title='UBB Mart' btn={() => navigation.goBack()} />
                {userReducer.agent_type == 'main' &&
                    <View style={styles.contentTransfer}>
                        <Text style={styles.textTransferBank}>Join UBB Mart</Text>
                    </View>
                }
                {(userReducer.agent_type == 'minimart' || userReducer.agent_type == 'mart') &&
                    <View style={styles.contentTransfer}>
                        <Text style={styles.textTransferBank}>Upgrade UBB Mart</Text>
                    </View>
                }
                {userReducer.agent_type == 'supermart' &&
                    <ScrollView>
                        <View style={styles.menu}>
                            <Text style={styles.titleMenu}>Pendaftaran Mitra / Downline</Text>
                            <SubMenu
                                titleMenu="Pendaftaran Downline / Mitra Langsung"
                                icon="user-plus"
                                style={styles.subMenu}
                                navigasi={() => navigation.navigate('Jaringan')}
                            />
                        </View>
                        <View style={styles.menu}>
                            <Text style={styles.titleMenu}>Mitra Langsung / Downline</Text>
                            <SubMenu
                                titleMenu="Mitra Langsung / Downline"
                                icon="users"
                                navigasi={() => navigation.navigate('Downline')}
                            />
                        </View>
                    </ScrollView>
                }
            </View>
            {userReducer.agent_type == 'main' &&
                <View style={[styles.containerButton]}>
                    <ButtonCustom
                        name='Join Sekarang'
                        width='85%'
                        color={colors.btn}
                        func={() => Alert.alert(
                            'Peringatan',
                            `Join sekarang ? `,
                            [
                                {
                                    text: 'Tidak',
                                    onPress: () => console.log('tidak')
                                },
                                {
                                    text: 'Ya',
                                    onPress: () => actionJoin()
                                }
                            ]
                        )}
                    />
                </View>
            }
            {(userReducer.agent_type == 'minimart' || userReducer.agent_type == 'mart') &&
                <View style={[styles.containerButton]}>
                    <ButtonCustom
                        name='Upgrade Sekarang'
                        width='85%'
                        color={colors.btn}
                        func={() => Alert.alert(
                            'Peringatan',
                            `Upgrade sekarang ? `,
                            [
                                {
                                    text: 'Tidak',
                                    onPress: () => console.log('tidak')
                                },
                                {
                                    text: 'Ya',
                                    onPress: () => actionUpgrade()
                                }
                            ]
                        )}
                    />
                </View>
            }
        </SafeAreaView>
    );
};

export default Mart;

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
    infoTopUp: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#ffffff',
    },
    textTopUpKe: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    contentInfoSaldo: {
        borderWidth: 1,
        borderRadius: 10,
        borderColor: colors.disable,
        padding: 10,
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    iconWallet: {
        marginRight: 20,
        borderWidth: 1,
        textAlign: 'center',
        padding: 5,
        borderRadius: 5,
        backgroundColor: colors.default,
        borderColor: colors.default,
        color: '#ffffff',
    },
    textMinyakBelogCash: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    infoSaldo: {
        color: colors.dark,
    },
    contentNominalTopUp: {
        backgroundColor: '#ffffff',
        marginTop: 5,
        padding: 20,
    },
    textNominalTopUp: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    btnNominal: {
        borderWidth: 2,
        padding: 10,
        borderRadius: 50,
        borderColor: '#fbf6f0',
        marginHorizontal: 5,
    },
    textNominal: {
        fontSize: 13,
        color: 'black',
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
    contentTransfer: {
        marginTop: 5,
        // backgroundColor: 'red',
        padding: 20,
    },
    textTransferBank: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    boxBtnTambahKartuAtm: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    btnTambahBank: {
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
    containerButton: {
        backgroundColor: '#ffffff',
        height: 65,
        borderWidth: 1,
        borderColor: colors.disable,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonTopUp: {
        borderWidth: 1,
        borderRadius: 10,
        height: 45,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.disable,
        borderColor: colors.disable,
        paddingHorizontal: 100,
        paddingVertical: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
    },
    buttonColor: {
        backgroundColor: '#ff781f',
        borderColor: '#ff781f',
    },
    menu: {
        padding: 20,
      },
      titleMenu: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
      },
      line: {
        borderWidth: 5,
        borderColor: '#e8e8e8',
      },
      subMenu: {
        paddingVertical: 20,
      },
});
