// NavigationBar.js
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import LottieView from 'lottie-react-native';

const NavigationBar = ({ goToStore, goToGarden, goToProfile, openAddTaskModal }) => {
  return (
    <View style={styles.navigationBar}>
      <TouchableOpacity style={styles.navButton} onPress={goToStore}>
        <LottieView
          source={require('../assets/animations/gema.json')}
          autoPlay
          loop
          style={styles.commonAnimation}
        />
        <Text style={styles.navButtonText}>Loja</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={openAddTaskModal}>
        <LottieView
          source={require('../assets/animations/cale.json')}
          autoPlay
          loop
          style={styles.addAnimation}
        />
        <Text style={styles.navButtonText}>Adicionar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={goToGarden}>
        <LottieView
          source={require('../assets/animations/tree.json')}
          autoPlay
          loop
          style={styles.commonAnimation}
        />
        <Text style={styles.navButtonText}>Jardim</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={goToProfile}>
        <Image
          source={require('../assets/icons/netflix.png')}
          style={styles.profileImage}
        />
        <Text style={styles.navButtonText}>Perfil</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navigationBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f7f7f7',
  },
  navButton: {
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 12,
    color: '#333',
    marginTop: 5,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  commonAnimation: {
    width: 40,
    height: 40,
  },
  addAnimation: {
    width: 50,
    height: 40,
  },
});

export default React.memo(NavigationBar);
