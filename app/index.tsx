import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Modal,
  FlatList,
  ScrollView,
  GestureResponderEvent,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Ensure you have this installed

const App = () => {
  const [displayValue, setDisplayValue] = useState('0');
  const [operator, setOperator] = useState(null);
  const [firstValue, setFirstValue] = useState(null);
  const [history, setHistory] = useState<string[]>([]);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [currentExpression, setCurrentExpression] = useState('');
  const [isAdvancedFunctionsVisible, setIsAdvancedFunctionsVisible] = useState(false);

  // Key for storing history in AsyncStorage
  const HISTORY_STORAGE_KEY = 'calculator_history';

  // Load history from AsyncStorage on app start
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const storedHistory = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
        if (storedHistory) {
          setHistory(JSON.parse(storedHistory));
        }
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    };

    loadHistory();
  }, []);

  // Save history to AsyncStorage whenever it changes
  useEffect(() => {
    const saveHistory = async () => {
      try {
        await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
      } catch (error) {
        console.error('Failed to save history:', error);
      }
    };

    saveHistory();
  }, [history]);

  const handleNumberPress = (number: string | number) => {
    if (displayValue === '0') {
      setDisplayValue(number.toString());
      setCurrentExpression(number.toString());
    } else {
      setDisplayValue(displayValue + number);
      setCurrentExpression(currentExpression + number);
    }
  };

  const handleOperatorPress = (operatorPressed) => {
    if (displayValue !== '0') {
      setOperator(operatorPressed);
      setFirstValue(displayValue);
      setCurrentExpression(currentExpression + ' ' + operatorPressed + ' ');
      setDisplayValue('');
    }
  };

  const performAdvancedCalculation = (type) => {
    const currentValue = parseFloat(displayValue);
    let result;
    let expression;

    switch (type) {
      case 'log':
        result = Math.log10(currentValue);
        expression = `log(${currentValue}) = ${result}`;
        break;
      case 'ln':
        result = Math.log(currentValue);
        expression = `ln(${currentValue}) = ${result}`;
        break;
      case 'sin':
        result = Math.sin(currentValue);
        expression = `sin(${currentValue}) = ${result}`;
        break;
      case 'cos':
        result = Math.cos(currentValue);
        expression = `cos(${currentValue}) = ${result}`;
        break;
      case 'tan':
        result = Math.tan(currentValue);
        expression = `tan(${currentValue}) = ${result}`;
        break;
      case 'pow':
        result = Math.pow(parseFloat(firstValue), currentValue);
        expression = `${firstValue} ^ ${currentValue} = ${result}`;
        break;
      case 'exp':
        result = Math.exp(currentValue);
        expression = `e^${currentValue} = ${result}`;
        break;
      case 'sqrt':
        result = Math.sqrt(currentValue);
        expression = `sqrt(${currentValue}) = ${result}`;
        break;
      default:
        return;
    }

    setDisplayValue(result.toString());
    setCurrentExpression(expression);
    setHistory((prevHistory) => [...prevHistory, expression]);
  };

  const handleEqualsPress = () => {
    if (operator && firstValue) {
      const num1 = parseFloat(firstValue);
      const num2 = parseFloat(displayValue);

      let result = 0;
      let expression = '';

      switch (operator) {
        case '+':
          result = num1 + num2;
          break;
        case '-':
          result = num1 - num2;
          break;
        case '*':
          result = num1 * num2;
          break;
        case '/':
          if (num2 === 0) {
            result = 'Error';
          } else {
            result = num1 / num2;
          }
          break;
        default:
          return;
      }

      expression = `${currentExpression} = ${result}`;

      setDisplayValue(result.toString());
      setOperator(null);
      setFirstValue(null);
      setCurrentExpression(result.toString());

      setHistory((prevHistory) => [...prevHistory, expression]);
    }
  };

  const handleClearPress = () => {
    setDisplayValue('0');
    setOperator(null);
    setFirstValue(null);
    setCurrentExpression('');
  };

  const handleDecimalPress = () => {
    if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
      setCurrentExpression(currentExpression + '.');
    }
  };

  const renderButton = (label: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined, onPress: ((event: GestureResponderEvent) => void) | undefined, style = {}, textStyle = {}) => (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={[styles.buttonText, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <Text style={styles.historyText}>{item}</Text>
    </View>
  );

  const toggleHistoryModal = () => {
    setIsHistoryModalVisible(!isHistoryModalVisible);
  };

  const toggleAdvancedFunctions = () => {
    setIsAdvancedFunctionsVisible(!isAdvancedFunctionsVisible);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />

      {/* History Button at Top Left */}
      <TouchableOpacity style={styles.historyButtonTopLeft} onPress={toggleHistoryModal}>
        <Feather name="rotate-ccw" size={28} color="#CBD5E1" />
      </TouchableOpacity>

      <View style={styles.displayContainer}>
        <Text style={styles.expressionText}>{currentExpression}</Text>
        <Text style={styles.displayText}>{displayValue}</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <ScrollView>
        <View style={styles.row}>
          {renderButton('C', handleClearPress, styles.clearButton, styles.clearButtonText)}
          {renderButton('+/-', () => console.log('+/-'), styles.functionButton)}
          {renderButton('%', () => console.log('%'), styles.functionButton)}
          {renderButton('/', () => handleOperatorPress('/'), styles.operatorButton)}
        </View>

        <View style={styles.row}>
          {renderButton('7', () => handleNumberPress(7), styles.numberButton)}
          {renderButton('8', () => handleNumberPress(8), styles.numberButton)}
          {renderButton('9', () => handleNumberPress(9), styles.numberButton)}
          {renderButton('*', () => handleOperatorPress('*'), styles.operatorButton)}
        </View>

        <View style={styles.row}>
          {renderButton('4', () => handleNumberPress(4), styles.numberButton)}
          {renderButton('5', () => handleNumberPress(5), styles.numberButton)}
          {renderButton('6', () => handleNumberPress(6), styles.numberButton)}
          {renderButton('-', () => handleOperatorPress('-'), styles.operatorButton)}
        </View>

        <View style={styles.row}>
          {renderButton('1', () => handleNumberPress(1), styles.numberButton)}
          {renderButton('2', () => handleNumberPress(2), styles.numberButton)}
          {renderButton('3', () => handleNumberPress(3), styles.numberButton)}
          {renderButton('+', () => handleOperatorPress('+'), styles.operatorButton)}
        </View>

        <View style={styles.row}>
          {renderButton('0', () => handleNumberPress(0), styles.doubleButton)}
          {renderButton('.', handleDecimalPress, styles.numberButton)}
          {renderButton('=', handleEqualsPress, styles.equalsButton)}
        </View>

        <View style={styles.row}>
          {renderButton(
            isAdvancedFunctionsVisible ? 'Hide Functions' : 'More Functions',
            toggleAdvancedFunctions,
            styles.functionButton
          )}
        </View>

        {isAdvancedFunctionsVisible && (
          <View>
            <View style={styles.row}>
              {renderButton('log', () => performAdvancedCalculation('log'), styles.functionButton)}
              {renderButton('ln', () => performAdvancedCalculation('ln'), styles.functionButton)}
              {renderButton('e^x', () => performAdvancedCalculation('exp'), styles.functionButton)}
              {renderButton('x^y', () => {
                setOperator('^');
                setFirstValue(displayValue);
                setCurrentExpression(currentExpression + '^');
                setDisplayValue('');
              }, styles.functionButton)}
            </View>

            <View style={styles.row}>
              {renderButton('sin', () => performAdvancedCalculation('sin'), styles.functionButton)}
              {renderButton('cos', () => performAdvancedCalculation('cos'), styles.functionButton)}
              {renderButton('tan', () => performAdvancedCalculation('tan'), styles.functionButton)}
              {renderButton('sqrt', () => performAdvancedCalculation('sqrt'), styles.functionButton)}
            </View>
          </View>
        )}
        </ScrollView>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isHistoryModalVisible}
        onRequestClose={toggleHistoryModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Calculation History</Text>
            <FlatList
              data={history}
              renderItem={renderHistoryItem}
              keyExtractor={(item, index) => index.toString()}
            />
            <TouchableOpacity style={styles.closeButton} onPress={toggleHistoryModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E293B',
  },
  displayContainer: {
    flex: 2,
    backgroundColor: '#1E293B',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  displayText: {
    fontSize: 60, // Reduced font size
    color: '#CBD5E1', // Light gray
    textAlign: 'right',
    fontWeight: '300', // Light font weight
  },
  expressionText: {
    fontSize: 24, // Reduced font size
    color: '#64748B', // Medium gray
    textAlign: 'right',
    fontWeight: '300',
  },
  buttonsContainer: {
    flex: 3,
    backgroundColor: '#334155', // Darker background
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#475569', // Dark button color
    borderRadius: 12, // Rounded corners
    marginHorizontal: 5,
    height: 70, // Fixed height for buttons
  },
  buttonText: {
    fontSize: 28, // Adjusted font size
    color: '#CBD5E1',
    fontWeight: '400',
  },
  numberButton: {
    backgroundColor: '#475569',
  },
  doubleButton: {
    flex: 2,
  },
  operatorButton: {
    backgroundColor: '#F97316', // Orange
  },
  clearButton: {
    backgroundColor: '#DC2626', // Red
  },
  clearButtonText: {
    color: '#FFFFFF',
  },
  equalsButton: {
    backgroundColor: '#10B981', // Green
  },
  functionButton: {
    backgroundColor: '#64748B', // Gray
  },
  // History button style
  historyButtonTopLeft: {
    position: 'absolute',
    top: 10, // Adjust as needed for StatusBar height
    left: 20,
    zIndex: 10, // Ensure it's above other elements
    padding: 10,
  },
  historyButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Modal Styles
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 15,
    textAlign: 'center',
    color: '#1E293B',
  },
  historyItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    width: '100%',
  },
  historyText: {
    fontSize: 16,
    color: '#334155',
  },
  closeButton: {
    backgroundColor: '#4338CA',
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default App;