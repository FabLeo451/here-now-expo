import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
	container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
	},
	containerList: {
    flex: 1,
    backgroundColor: 'white',
	},
	mainTitle: {
		marginTop: 60,
		marginBottom: 100,
		textAlign: 'center',
		fontFamily: 'Dosis_600SemiBold',
    fontSize: 40
	},
	title: {
		marginTop: 10,
		marginBottom: 20,
		textAlign: 'center',
		fontFamily: 'Ubuntu_300Light'
	},
	input: {
    backgroundColor: "white",
    minWidth: 300,
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#2196F3',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',

    // Ombra per Android
    elevation: 5,

    // Ombra per iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 5
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
    marginTop: 10,
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
    //paddingHorizontal: 16,
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
  listItem: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomColor: 'gainsboro',
    borderBottomWidth: 1
    /*
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Android shadow
    */
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10
  },
  deleteButton: {
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
  textArea: {
    height: 90,
    borderColor: 'lightgray',
    borderWidth: 1,
    padding: 10,
    textAlignVertical: 'top', // necessario per multiline su Android
    borderRadius: 8,
  },
});

export { styles }

