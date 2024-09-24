import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import LottieView from 'lottie-react-native';

const XPBar = ({
  experienciaAtual,
  experienciaMaxima,
  nivelAtual,
  pontos,
  onPress,
}) => {
  // Calcula o progresso como uma fração entre 0 e 1
  const progress = experienciaMaxima > 0 ? experienciaAtual / experienciaMaxima : 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={styles.container}>
        {/* Seção do nível e experiência */}
        <View style={styles.levelSection}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{nivelAtual}</Text>
          </View>
          <View style={styles.experienceInfo}>
            <Text style={styles.experienceText}>
              {`${experienciaAtual}/${experienciaMaxima} XP`}
            </Text>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progress * 100}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Seção de pontos */}
        <View style={styles.pointsSection}>
          <Text style={styles.pointsText}>{pontos}</Text>
          <LottieView
            source={require('../assets/animations/coin.json')}
            autoPlay
            loop
            style={styles.coinAnimation}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

XPBar.propTypes = {
  experienciaAtual: PropTypes.number.isRequired,
  experienciaMaxima: PropTypes.number.isRequired,
  nivelAtual: PropTypes.number.isRequired,
  pontos: PropTypes.number.isRequired,
  onPress: PropTypes.func,
};

XPBar.defaultProps = {
  onPress: () => {},
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D3748',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    // Definindo uma altura fixa, se necessário
    // height: 80,
  },
  levelSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 8, // Ocupa 8 unidades do grid
    marginRight: 8,
  },
  levelBadge: {
    backgroundColor: '#3182CE',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  experienceInfo: {
    flex: 1,
  },
  experienceText: {
    color: '#E2E8F0',
    fontSize: 14,
    marginBottom: 4,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#4A5568',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#48BB78',
  },
  pointsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 4, // Ocupa 4 unidades do grid
    // flexShrink: 0, // Removido para permitir que o flex funcione corretamente
    justifyContent: 'flex-end', // Alinha os pontos à direita da seção
  },
  pointsText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 4,
  },
  coinAnimation: {
    width: 24,
    height: 24,
  },
});

export default XPBar;
