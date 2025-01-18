import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View, Button, TextInput, StatusBar, TouchableOpacity, Linking, Switch, Image, ScrollView, TouchableWithoutFeedback, Keyboard} from 'react-native';
import { addEventListener } from "@react-native-community/netinfo";
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';

const BACKGROUND_FETCH_TASK = 'background-fetch';

async function registerBackgroundFetchAsync() {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 61 * 60,
    stopOnTerminate: false, // android only,
    startOnBoot: true, // android only
  });
}
async function unregisterBackgroundFetchAsync() {
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
}

const logToStorage = async (message) => {
  const { getItem, setItem } = useAsyncStorage('logs');
  let logs = JSON.parse(await getItem()) || [];
  const timestamp = new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  logs.unshift({ timestamp, message: `${timestamp}: ${message}` });
  
  if(logs.length > 10) logs = logs.slice(0, 10);
  await setItem(JSON.stringify(logs));
};

export default function App() {
  const [user, setUserValue] = useState(null);
  const [pass, setPassValue] = useState(null);
  const [toggle, setToggleValue] = useState(true);
  const { getItem: getUser, setItem: setUser } = useAsyncStorage("username");
  const { getItem: getPass, setItem: setPass } = useAsyncStorage("password");
  const { getItem: getToggle, setItem: setToggle } = useAsyncStorage("toggle");
  const {getItem: getLast, setItem: setLast} = useAsyncStorage('last');
  const [lastLogin, setLastLogin] = useState(new Date(0));
  const [listener, setListener] = useState(undefined);

  const [showPass, setShowPass] = useState(false);
  const toggleShowPassword = () => {
    setShowPass(!showPass);
  };

  const forceLogout = async () => {
    const logoutFetched = await fetch("http://172.16.222.1:1000/logout?0307020009020400", {
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "accept-language": "en-US,en",
        "sec-gpc": "1",
        "upgrade-insecure-requests": "1",
        "Referer": "http://172.16.222.1:1000/keepalive?0307020009020400",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      "body": null,
      "method": "GET"
    }).catch(() => {});
    return;
    // console.log(logoutFetched);
  }

  const forceLogin = async (bg = false) => {
    console.log("logging in")
    try{
      logToStorage("GETTING magic")
      const fetched = await fetch("http://172.16.222.1:1000/login?0330598d1f22608a", {
        "headers": {
          "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "accept-language": "en-US,en",
          "cache-control": "max-age=0",
          "sec-gpc": "1",
          "upgrade-insecure-requests": "1"
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET"
      }).catch(() => {
      });
      if(!fetched || !fetched?.ok){
        logToStorage("Failed to get magic");
        if(!bg) Alert.alert("Not connected to IIIT Kottayam");
        return 1;
      }
      const ht = await fetched.text();
      const reg = new RegExp(/magic" value="([a-zA-Z0-9]+)"/gi)
      const r = Array.from(ht.matchAll(reg), m => m[1]);
      const magic = r[0];
      logToStorage("POSTING login");
      const r2 = await fetch("http://172.16.222.1:1000/", {
        "headers": {
          "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "accept-language": "en-US,en",
          "cache-control": "max-age=0",
          "content-type": "application/x-www-form-urlencoded",
          "sec-gpc": "1",
          "upgrade-insecure-requests": "1",
          "Referer": "http://172.16.222.1:1000/login?0330598d1f22608a",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": `4Tredir=http%3A%2F%2F172.16.222.1%3A1000%2Flogin%3F0330598d1f22608a&magic=${magic}&username=${user}&password=${encodeURI(pass)}`,
        "method": "POST"
      }).catch(e => e);
      
      if(!r2 || !r2.ok) {
        logToStorage(`Failed to POST login: ${r2}`);
        return 2;
      }
      
      logToStorage("Checking keep alive");
      const nowConnectedFetch = await fetch("http://172.16.222.1:1000/keepalive?0001080905090609", {
        "headers": {
          "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "accept-language": "en-US,en",
          "cache-control": "max-age=0",
          "sec-gpc": "1",
          "upgrade-insecure-requests": "1",
          "Referer": "http://172.16.222.1:1000/",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET"
      }).catch(() => {});
      if(!nowConnectedFetch || !nowConnectedFetch.ok) {
        logToStorage("Failed keep alive");
        if(!bg) Alert.alert("Incorrect Credentials");
        return 3;
      }
      logToStorage("Success");
      console.log('connected now')
      if(!bg) Alert.alert("Connected")
      updateLast();
    } catch (e) {
      if(!bg) Alert.alert("Error occured!");  
      console.error(e)
    }

    
  }

  const verifyInfo = async () => {
    if(pass == null){
      Alert.alert("Invalid username or password");
      return false;
    }
  
    if(user.length != 11 || !(/^202[1-9](bc[a-z]|bec)[0-9]{4}$/gmi.test(user))){
      Alert.alert("Invalid Username");
      return false;
    } 
    return true;
  }
  
  const readAll = async () => {
    setUserValue(await getUser() ?? "");
    setPassValue(await getPass() ?? "");
    setToggleValue((await getToggle()) == "true" ? true : false);
    setLastLogin(new Date(parseInt(await getLast())) ?? new Date(0));
  }
  
  const updateLast = async () => {
    setLastLogin(new Date());
    await setLast(Date.now().toString());
  }

  const writeInfo = async () => {
    await setUser(user);
    await setPass(pass);
  }

  const writeToggle = async () => {    
    setToggleValue(!toggle);
    await setToggle(!toggle ? "true" : "false");
  }

  const tapToggle = () => {
    // setToggleValue(!toggle)
    if(!toggle) {
      registerBackgroundFetchAsync();
      setListener(addEventListener(state => {
        // console.log(state.isWifiEnabled)
        if(state.type == "wifi" && ((lastLogin.getTime() + 1 * 60 * 60 * 1000) <= Date.now())){ //  
          // forceLogout();
          forceLogin(true);
        } else { 
          console.log(`last logged in ${(Date.now() - lastLogin.getTime())/1000}`) 
        }
      }))
    } else {
      unregisterBackgroundFetchAsync();
      if(listener !== undefined) listener();
    }
    writeToggle();

  }


  const submitted = async () => {
  
    if(await verifyInfo() || true){
      writeInfo();
      forceLogout();
      forceLogin(false);  
    }
  }
  
  const viewLogs = async () => {
    const { getItem } = useAsyncStorage('logs');
    const logs = JSON.parse(await getItem()) || [];
    Alert.alert("Logs", logs.map(log => log.message).join('\n\n'));
  }

  useEffect(() => {
    readAll();
    TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
      try {
        await logToStorage("Background fetch task running");
        if(await forceLogin(true) == 0){
          await logToStorage("Background fetch task completed");
          return BackgroundFetch.BackgroundFetchResult.NewData;
        } else {
          await logToStorage(`Background fetch task failed`);
          return BackgroundFetch.BackgroundFetchResult.Failed;  
        }
        
      } catch (error) {
        await logToStorage(`Background fetch task error: ${error}`);
        return BackgroundFetch.BackgroundFetchResult.Failed;
      }
    });
  
    if (toggle) {
      setListener(addEventListener(state => {
        if (state.type == "wifi" && ((lastLogin.getTime() + 1 * 60 * 60 * 1000) <= Date.now())) {
          forceLogin(true);
        } else {
          logToStorage(`Stopped. Recently logged in;`);
        }
      }));
    }
  
    registerBackgroundFetchAsync().catch(async error => {
      await logToStorage(`Failed to register background fetch task: ${error}`);
    });
  
  }, []);
  
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} 
    accessible={false}>
    <View style={styles.container}>
      <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", paddingLeft: 15, paddingRight: 15, paddingTop: 15, alignItems: "center"}}>
        <Text style={{color: "#878787", fontSize: 18, paddingLeft: 5}} onPress={viewLogs}>{toggle ? "WiFixing" : "Not WiFixing"} {lastLogin.toLocaleString('en-GB', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</Text>
        <Switch trackColor={{false: '#ddd', true: '#fff'}}
          thumbColor={toggle ? '#2e8bc0' : '#0c2d48'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={tapToggle}
          value={toggle} style={styles.switch}/>  
      </View>
      <Image source={require("./assets/mainIcon.png")} style={styles.icon}/>
      {/* <Suspense fallback={null}>
          <Text style={{color: "#222"}}>last run {lastRun?.toString()}</Text>
        </Suspense> */}
      <View style={styles.form}>
        <Text style={{color: "#fff", marginBottom: 5, fontSize: 16}}>Username</Text>
        <TextInput
          style={styles.input}
          // placeholder='2024BCD0000'
          onChangeText={setUserValue}
          defaultValue={user}
        />
        <Text style={{color: "#fff", marginBottom: 5, fontSize: 16}}>Password</Text>
        <View style={styles.passContainer}>
          <TextInput
            placeholder='_________________'
            onChangeText={setPassValue}
            secureTextEntry={!showPass}
            defaultValue={pass}
            style={{color: "#fff", width: "80%", fontSize: 15}}
          />
          <MaterialCommunityIcons
            name={showPass ? 'eye-off' : 'eye'}
            size={24}
            color="#aaa"
            style={styles.icon}
            onPress={toggleShowPassword}
          />
        </View>
        <Button title="Connect" onPress={submitted} style={styles.sub} color="#2e8bc0"/>
        {/* <Button title="View Logs" onPress={viewLogs} style={styles.sub} color="#2e8bc0"/> */}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => Linking.openURL("https://www.instagram.com/mathew._21")}>
          <Text style={styles.footerText}>Developed by Mathew Manachery</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL("https://www.instagram.com/basi__gar")}>
          <Text style={styles.footerText}>Logo by Muhammed Basil</Text>

          {/* <View style={{justifyContent: "center", display: "flex", alignItems: "center", flexDirection: "row"}}>
             <Feather color="white" size={15} name='external-link'/> 
            </View> */}
          
        </TouchableOpacity>

        
        <TouchableOpacity onPress={() => Linking.openURL("https://github.com/mathew2103/wifix")} style={{justifyContent: "center", display: "flex", alignItems: "center", flexDirection: "row"}}>
          <Text style={styles.footerText}>Version {require("./app.json").expo.version}</Text>
          <AntDesign color="white" size={20} name='github' style={{alignContent: "center", alignSelf: "center", paddingLeft:5}}/>
            </TouchableOpacity>
        

        
      </View>

      <StatusBar backgroundColor='#000' barStyle='light-content'/>
      
    </View>
    </TouchableWithoutFeedback>
  );

}

const styles = StyleSheet.create({
  icon: {
    borderRadius: 5,
    maxHeight: 150, 
    resizeMode: "contain", 
    maxWidth: 150,
  },
  footer: {
    flex: 0.2,
    justifyContent: "center",
  },
  footerText: {
    color: "#fff",
    alignSelf: "center",
    marginBottom: 3,
    textAlign: "center"
  },
  form: {
    flex: 0.6
  },  
  lastRun: {
    flex:0.4,
    justifyContent: "center"
  },
  sub: {
    margin: 50
  },
  container: {
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: "space-between",
    flex: 1
  },
  input: {
    backgroundColor: '#000',
    color: "#fff",
    borderRadius: 8,
    paddingHorizontal: 14,
    width: 200,
    height: 50,
    marginBottom: 25,
    shadowColor: "#2e8bc0",
    elevation: 10,
    borderWidth: 0.9,
    borderColor: "#2e8bc0", fontSize: 15
  },
  passContainer: {
    marginBottom: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000',
    color: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
    width: 200,
    height: 50,
    shadowColor: "#2e8bc0",
    elevation: 10,
    borderWidth: 0.9,

    borderColor: "#2e8bc0", fontSize: 16
  }
});