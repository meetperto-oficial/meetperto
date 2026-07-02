import { Switch, View, Text, Alert } from 'react-native';
import { Colors } from '../theme/colors';

export default function SettingsScreen({ navigation }) {
  const [invisibleMode, setInvisibleMode] = useState(false);
  const [userPlan, setUserPlan] = useState('gratis');

  const toggleInvisibleMode = async (value) => {
    if (userPlan!== 'vip') {
      navigation.navigate('Paywall', { feature: 'invisivel' });
      return;
    }
    
    await updateUser(user.uid, { invisibleMode: value });
    setInvisibleMode(value);
  }

  return (
    <View>
      {userPlan === 'vip' && (
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.title}>Modo Invisível</Text>
            <Text style={[styles.subtitle, { color: Colors.textLight }]}>
              Navegue sem aparecer em "quem te visitou"
            </Text>
          </View>
          <Switch 
            value={invisibleMode} 
            onValueChange={toggleInvisibleMode}
            trackColor={{ true: Colors.vip }}
          />
        </View>
      )}
    </View>
  );
}
