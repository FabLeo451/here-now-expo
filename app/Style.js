import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
	container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
	},
	mainTitle: {
		marginTop: 60,
		marginBottom: 100,
		textAlign: 'center',
		fontFamily: 'Dosis_600SemiBold'
	},
	title: {
		marginTop: 10,
		marginBottom: 20,
		textAlign: 'center',
		fontFamily: 'Ubuntu_300Light'
	},
	input: {
		marginBottom: 15,
    backgroundColor: "white"
	},
	button: {
		minWidth: 250,
		alignSelf: 'center',
		marginVertical: 10,
	},
	selectButton: {
    width: 40,
    height: 40,
    backgroundColor: '#007AFF',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
	},
	link: {
		textAlign: 'center',
		marginVertical: 15,
		textDecorationLine: 'underline',
		/*cursor: 'pointer', */// per web
	},
	divider: {
		textAlign: 'center',
		marginVertical: 10,
	},
	footer: {
		position: 'absolute',
		bottom: 20,
		left: 0,
		right: 0,
		textAlign: 'center',
		fontSize: 12,
		color: 'dimgray',
	},
  hello: {
    fontWeight: 'bold',
    fontSize: 20,
    marginVertical: 12,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 5,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', 
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: 'row',   // Tutti su una linea
    justifyContent: 'flex-start', // Allineati a sinistra
    alignItems: 'center',   // Centra verticalmente (opzionale)
    gap: 10, 
  },
  scrollContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Android shadow
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    color: '#cc0000',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingVertical: 16,
  },
});

export { styles }

