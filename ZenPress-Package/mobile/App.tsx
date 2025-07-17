import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');

  const renderHomeScreen = () => (
    <ScrollView style={styles.content}>
      <LinearGradient
        colors={['#2196F3', '#1976D2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>ZenPress</Text>
        <Text style={styles.headerSubtitle}>Alívio Natural da Dor</Text>
      </LinearGradient>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categorias</Text>
        
        <TouchableOpacity style={styles.categoryCard}>
          <View style={styles.categoryIcon}>
            <Ionicons name="brain" size={24} color="#E91E63" />
          </View>
          <View style={styles.categoryText}>
            <Text style={styles.categoryTitle}>Craniopuntura</Text>
            <Text style={styles.categoryDescription}>Pontos do couro cabeludo para dor de cabeça</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.categoryCard}>
          <View style={styles.categoryIcon}>
            <Ionicons name="leaf" size={24} color="#4CAF50" />
          </View>
          <View style={styles.categoryText}>
            <Text style={styles.categoryTitle}>MTC</Text>
            <Text style={styles.categoryDescription}>Medicina Tradicional Chinesa</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.categoryCard}>
          <View style={styles.categoryIcon}>
            <Ionicons name="heart" size={24} color="#FF9800" />
          </View>
          <View style={styles.categoryText}>
            <Text style={styles.categoryTitle}>Saúde Mental</Text>
            <Text style={styles.categoryDescription}>Bem-estar e relaxamento</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        
        <TouchableOpacity 
          style={[styles.actionCard, styles.quickAction]}
          onPress={() => setCurrentTab('timer')}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="flash" size={20} color="#FFC107" />
          </View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>Alívio Rápido</Text>
            <Text style={styles.actionDescription}>Técnicas de 1 minuto - Clique para ir ao Timer</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={[styles.actionCard, styles.premiumCard]}>
          <View style={styles.actionIcon}>
            <Ionicons name="diamond" size={20} color="#2196F3" />
          </View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>Premium</Text>
            <Text style={styles.actionDescription}>Técnicas avançadas exclusivas</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderTimerScreen = () => (
    <LinearGradient
      colors={['#1976D2', '#2196F3']}
      style={styles.timerContainer}
    >
      <Text style={styles.timerTitle}>Timer de Acupressão</Text>
      <Text style={styles.timerSubtitle}>Respiração 4-7-8</Text>
      
      <View style={styles.timerCircle}>
        <Text style={styles.timerText}>01:00</Text>
        <Text style={styles.timerPhase}>Pronto para começar</Text>
      </View>
      
      <TouchableOpacity style={styles.timerButton}>
        <Ionicons name="play" size={24} color="#fff" />
        <Text style={styles.timerButtonText}>Iniciar</Text>
      </TouchableOpacity>
    </LinearGradient>
  );

  const renderTechniquesScreen = () => (
    <ScrollView style={styles.content}>
      <LinearGradient
        colors={['#1976D2', '#2196F3']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Técnicas</Text>
        <Text style={styles.headerSubtitle}>Acupressão e Medicina Tradicional</Text>
      </LinearGradient>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Técnicas Disponíveis</Text>
        
        <TouchableOpacity style={styles.techniqueCard}>
          <View style={styles.techniqueInfo}>
            <Text style={styles.techniqueName}>Yintang EX-HN3</Text>
            <Text style={styles.techniqueDesc}>Ponto central entre as sobrancelhas</Text>
            <Text style={styles.techniqueDuration}>⏱️ 1 min • 🟢 Fácil</Text>
          </View>
          <TouchableOpacity style={styles.playButton}>
            <Ionicons name="play-circle" size={32} color="#2196F3" />
          </TouchableOpacity>
        </TouchableOpacity>

        <TouchableOpacity style={styles.techniqueCard}>
          <View style={styles.techniqueInfo}>
            <Text style={styles.techniqueName}>Zusanli ST36</Text>
            <Text style={styles.techniqueDesc}>Ponto abaixo do joelho para imunidade</Text>
            <Text style={styles.techniqueDuration}>⏱️ 3 min • 🟢 Fácil</Text>
          </View>
          <TouchableOpacity style={styles.playButton}>
            <Ionicons name="play-circle" size={32} color="#2196F3" />
          </TouchableOpacity>
        </TouchableOpacity>

        <TouchableOpacity style={styles.techniqueCard}>
          <View style={styles.techniqueInfo}>
            <Text style={styles.techniqueName}>Shenmen HE7</Text>
            <Text style={styles.techniqueDesc}>Ponto no pulso para ansiedade</Text>
            <Text style={styles.techniqueDuration}>⏱️ 2 min • 🟢 Fácil</Text>
          </View>
          <TouchableOpacity style={styles.playButton}>
            <Ionicons name="play-circle" size={32} color="#2196F3" />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (currentTab) {
      case 'timer':
        return renderTimerScreen();
      case 'techniques':
        return renderTechniquesScreen();
      default:
        return renderHomeScreen();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {renderContent()}
      
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabItem, currentTab === 'home' && styles.tabItemActive]}
          onPress={() => setCurrentTab('home')}
        >
          <Ionicons name="home" size={24} color={currentTab === 'home' ? '#2196F3' : '#757575'} />
          <Text style={[styles.tabText, currentTab === 'home' && styles.tabTextActive]}>ZenPress</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, currentTab === 'timer' && styles.tabItemActive]}
          onPress={() => setCurrentTab('timer')}
        >
          <Ionicons name="timer" size={24} color={currentTab === 'timer' ? '#2196F3' : '#757575'} />
          <Text style={[styles.tabText, currentTab === 'timer' && styles.tabTextActive]}>Timer</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, currentTab === 'techniques' && styles.tabItemActive]}
          onPress={() => setCurrentTab('techniques')}
        >
          <Ionicons name="list" size={24} color={currentTab === 'techniques' ? '#2196F3' : '#757575'} />
          <Text style={[styles.tabText, currentTab === 'techniques' && styles.tabTextActive]}>Técnicas</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    padding: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryText: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickAction: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  premiumCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  timerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  timerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 50,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
  },
  timerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  timerPhase: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  timerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  timerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  techniqueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  techniqueInfo: {
    flex: 1,
  },
  techniqueName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  techniqueDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  techniqueDuration: {
    fontSize: 12,
    color: '#999',
  },
  playButton: {
    padding: 5,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabItemActive: {
    // Additional styling for active tab if needed
  },
  tabText: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  tabTextActive: {
    color: '#2196F3',
    fontWeight: '600',
  },
});
