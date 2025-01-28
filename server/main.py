from flask import Flask , jsonify , Response , request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
#from flask_marshmallow import Marshmallow
from flask_restful import Resource, Api, fields, marshal_with , reqparse
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
import toml
from flask_cors import CORS 
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io
import bcrypt

# similair to .env 
with open('config.toml', 'r') as f:
    config = toml.load(f)

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = config['database']['URI']
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = config["jwt"]["token"]

db = SQLAlchemy(app)
#ma = Marshmallow(app)
api = Api(app)
jwt = JWTManager(app)
# Modele User 
class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('admin', 'user'), nullable=False)

# Modele Fournisseur
class Fournisseur(db.Model):
    __tablename__ = 'fournisseurs'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nom = db.Column(db.String(255), unique=True, nullable=False)
    contact = db.Column(db.String(255), nullable=False)
    adresse = db.Column(db.String(255), nullable=False)
    contrats = db.relationship('Contrat', backref='fournisseur', cascade="all, delete-orphan", lazy=True)

# Modele Contrat
class Contrat(db.Model):
    __tablename__ = 'contrats'
    id = db.Column(db.String(20), primary_key=True)  # cle primaire du format GD-XXXXXX
    objet = db.Column(db.String(255), nullable=False)  # objet
    type = db.Column(db.Enum('Maintenance', 'Travaux', 'Étude', 'Acquisition'), nullable=False) # type de contrat 
    modalite_paiement = db.Column(db.Enum('Mensuel','Bimensuel','Trimestriel','Semestriel','Annuel','Par avance','Post-payé'), nullable=False) #modalitie de payment
    montant = db.Column(db.Numeric(10, 2), nullable=False)  # Montant bil dinar
    fournisseur_nom = db.Column(db.String(255), db.ForeignKey('fournisseurs.nom'), nullable=False)  # Cle etange jey mn tableau fournisseurs (le nom n'est pas un cle primaire mais il est unique)
    date_debut = db.Column(db.Date, nullable=False) 
    date_fin = db.Column(db.Date, nullable=False)
    etat_contrat = db.Column(db.Enum('résilé', 'suspendu'), nullable=True)

# serialisitaion des contrats
ContractFields = {
    'id': fields.String,
    'objet': fields.String,
    'type': fields.String,  
    'modalite_paiement': fields.String,  
    'montant': fields.Float,  
    'fournisseur_nom': fields.String, 
    'date_debut': fields.String,  
    'date_fin': fields.String,
    "etat_contrat" : fields.String
}
# Ressource  pour les contrats

class ContractsResource(Resource): 
    #@jwt_required()
    @marshal_with(ContractFields)
    def get(self):
        contrats = Contrat.query.all()  # récupérer tous les contrats
        return contrats
    @jwt_required()
    def post(self):
        """
        Cette méthode permet d'ajouter un nouveau contrat
        """
        data = request.get_json()

        # Remove the `id` field if provided, since it's handled by the database trigger
        data.pop('id', None)

        objet = data.get('objet')
        type_contrat = data.get('type')
        modalite_paiement = data.get('modalite_paiement')
        montant = data.get('montant')
        fournisseur_nom = data.get('fournisseur_nom')
        date_debut = data.get('date_debut')
        date_fin = data.get('date_fin')

        # Validate the input data
        if not all([objet, type_contrat, modalite_paiement, montant, fournisseur_nom, date_debut, date_fin]):
            return {"msg": "Les données sont incomplètes"}, 400

        # Verify if the supplier exists
        fournisseur = Fournisseur.query.filter_by(nom=fournisseur_nom).first()
        if not fournisseur:
            return {"msg": "Le fournisseur n'existe pas"}, 404

        # Add the new contract
        new_contrat = Contrat(
            id = "0",
            objet=objet,
            type=type_contrat,
            modalite_paiement=modalite_paiement,
            montant=montant,
            fournisseur_nom=fournisseur_nom,
            date_debut=date_debut,
            date_fin=date_fin
        )
        db.session.add(new_contrat)
        db.session.commit()

        return {"msg": "Le contrat a été ajouté avec succès"}, 201
    



class YearStat(Resource):
    @jwt_required()
    def get(self, year):
        # Query to count contracts by month for a given year
        results = (
            Contrat.query
            .with_entities(func.extract('month', Contrat.date_fin).label('month'), func.count().label('count'))
            .filter(func.extract('year', Contrat.date_fin) == year)
            .group_by('month')
            .all()
        )

        # Format results into a dictionary for easier reading
        month_counts = {int(month): count for month, count in results}
        mois_annee = {
            1: "Janvier",
            2: "Février",
            3: "Mars",
            4: "Avril",
            5: "Mai",
            6: "Juin",
            7: "Juillet",
            8: "Août",
            9: "Septembre",
            10: "Octobre",
            11: "Novembre",
            12: "Décembre"
        }


        # Get the total number of contracts for the specified year
        total_contracts = sum(month_counts.values())

        # Check if there are no contracts for the given year
        plt.figure(figsize=(12, 6))
        
        if not month_counts:
            # Create an empty graph
            plt.bar([], [])  # Empty bar chart
            plt.xlabel('Mois')
            plt.ylabel('Nombre de Contrats')
            plt.title(f'Aucun contrat terminé en {year}')
            plt.xticks([])  # No x-ticks for an empty graph
            plt.ylim(0, 1)  # Set y-limit to avoid axis scaling issues
        else:
            # Create a bar plot
            months = list(month_counts.keys())
            for i in range(len(months)) :
                months[i] = mois_annee[months[i]]
            counts = list(month_counts.values())

            plt.bar(months, counts, color='skyblue')
            plt.xlabel('Mois')
            plt.ylabel('Nombre de Contrats')
            plt.title(f'Contrats terminés en {year}')
            plt.xticks(months)  # Set x-ticks to be the months

            # Set Y-axis limits and format
            plt.ylim(0, max(counts) + 1)  # Set y-limit slightly above max count for better visibility
            plt.gca().yaxis.set_major_locator(plt.MaxNLocator(integer=True))  # Ensure y-ticks are integers

        # Save the plot to a BytesIO object
        img = io.BytesIO()
        plt.savefig(img, format='png')
        plt.close()  # Close the figure to free memory
        img.seek(0)  # bch tarja3 t9ra el object mil lowl 

        # Return the image as a response
        return Response(img.getvalue(), mimetype='image/png')
class ContractTypeStat(Resource):
    @jwt_required()
    def get(self):
        year = request.args.get('year', type=int)  # Get the year from query parameters

        # Query to count contracts by type
        query = Contrat.query
        if year:
            query = query.filter(func.extract('year', Contrat.date_fin) == year)

        results = (
            query
            .with_entities(Contrat.type, func.count().label('count'))
            .group_by(Contrat.type)
            .all()
        )

        # Format results into a dictionary for easier reading
        type_counts = {contract_type: count for contract_type, count in results}

        # Create a pie chart
        plt.figure(figsize=(8, 8))
        labels = type_counts.keys()
        sizes = type_counts.values()
        colors = ['gold', 'lightcoral', 'lightskyblue', 'lightgreen']
        
        # Create the pie chart
        plt.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', startangle=140 , explode=(0,0,0,0.2),shadow=True)
        plt.axis('equal')  # Equal aspect ratio ensures that pie is drawn as a circle

        # Save the plot to a BytesIO object
        img = io.BytesIO()
        plt.savefig(img, format='png')
        plt.close()  # Close the figure to free memory
        img.seek(0)  # Seek to the start of the BytesIO object

        # Return the image as a response
        return Response(img.getvalue(), mimetype='image/png')
class ContractPaimentStat(Resource):
    @jwt_required()
    def get(self):
        year = request.args.get('year', type=int)  # Get the year from query parameters

        # Query to count contracts by payment type
        query = Contrat.query
        if year:
            query = query.filter(func.extract('year', Contrat.date_fin) == year)

        results = (
            query
            .with_entities(Contrat.modalite_paiement, func.count().label('count'))
            .group_by(Contrat.modalite_paiement)
            .all()
        )

        # Format results into a dictionary for easier reading
        type_counts = {contract_type: count for contract_type, count in results}

        # Create a pie chart
        plt.figure(figsize=(8, 8))
        labels = type_counts.keys()
        sizes = type_counts.values()
        colors = ['mediumorchid', 'salmon', 'turquoise', 'peachpuff', 'plum', 'khaki', 'steelblue', 'palegoldenrod']
        
        # Create the pie chart
        plt.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', startangle=140 ,shadow=True)
        plt.axis('equal')  # Equal aspect ratio ensures that pie is drawn as a circle

        # Save the plot to a BytesIO object
        img = io.BytesIO()
        plt.savefig(img, format='png')
        plt.close()  # Close the figure to free memory
        img.seek(0)  # Seek to the start of the BytesIO object

        # Return the image as a response
        return Response(img.getvalue(), mimetype='image/png')
class FournisseursPerformance(Resource):
    @jwt_required()
    def get(self):
        year = request.args.get('year', type=int)  # Get the year from query parameters

        # Query to count contracts by fournisseur
        query = Contrat.query
        if year:
            query = query.filter(func.extract('year', Contrat.date_fin) == year)

        results = (
            query
            .with_entities(Contrat.fournisseur_nom, func.count().label('count'))
            .group_by(Contrat.fournisseur_nom)
            .all()
        )

        fournisseurs_counts = {fournisseur: count for fournisseur, count in results}
        fournisseurs = list(fournisseurs_counts.keys())
        counts = list(fournisseurs_counts.values())

        # Set up the figure and axis
        fig, ax = plt.subplots(figsize=(10, 6))

        # Create horizontal bar plot
        y_pos = range(len(fournisseurs))
        ax.barh(y_pos, counts, align='center', color='turquoise')  # Horizontal bars

        # Customize the axis and labels
        ax.set_yticks(y_pos)  # Set y-axis ticks to match fournisseurs
        ax.set_yticklabels(fournisseurs)  # Set the labels for each tick
        ax.invert_yaxis()  # Display bars from top to bottom
        ax.set_xlabel('Contrats', fontsize=12)  # Label for x-axis
        ax.set_title('Fournisseurs', fontsize=14)  # Title for the plot

        # Set the x-axis to start from the smallest count and go to the largest count
        ax.set_xlim([min(counts) - 1, max(counts) + 1])
        for i, v in enumerate(counts):
            ax.text(v + 0.2, i, str(v), va='center', fontsize=10)

        # Save the plot to a BytesIO object
        img = io.BytesIO()
        plt.savefig(img, format='png')
        plt.close()  # Close the figure to free memory
        img.seek(0)  # Seek to the start of the BytesIO object

        # Return the image as a response
        return Response(img.getvalue(), mimetype='image/png')
class FournisseurContractStatusStat(Resource):
    @jwt_required()
    def get(self, fournisseur_nom):
        # Fetch contract statuses for the given fournisseur
        results = (
            Contrat.query
            .with_entities(Contrat.etat_contrat, func.count().label('count'))
            .filter(Contrat.fournisseur_nom == fournisseur_nom)
            .group_by(Contrat.etat_contrat)
            .all()
        )

        # Prepare data for pie chart
        type_counts = {status: count for status, count in results}
        
        # Initialize counts for each status
        canceled_count = type_counts.get('résilé', 0)
        suspended_count = type_counts.get('suspendu', 0)
        
        # If the status is null (not "résilé" or "suspendu"), it will be considered as "Terminé" (completed) or "En cours" (ongoing)
        ongoing_or_completed_count = type_counts.get(None, 0)
        
        # Prepare the labels and counts for the pie chart
        statuses = ['Résilé', 'Suspendu', 'Terminé/En Cours']
        counts = [canceled_count, suspended_count, ongoing_or_completed_count]

        # Create the pie chart
        plt.figure(figsize=(10, 6))
        labels = statuses
        sizes = counts
        colors = ['gold', 'lightcoral', 'lightskyblue']  # You can modify these colors if you like
        
        # Create the pie chart
        plt.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', startangle=140, explode=(0, 0, 0.2), shadow=True)
        plt.axis('equal')  # Equal aspect ratio ensures that pie is drawn as a circle
        
        # Save the plot to a BytesIO object
        img = io.BytesIO()
        plt.savefig(img, format='png')
        plt.close()  # Close the figure to free memory
        img.seek(0)  # Seek to the start of the BytesIO object
        
        # Return the image as a response
        return Response(img.getvalue(), mimetype='image/png')

class insertFourni(Resource) :
    @jwt_required()
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('nom', type=str, required=True, help="Le nom du fournisseur est requis")
        parser.add_argument('contact', type=str, required=True, help="Le contact du fournisseur est requis")
        parser.add_argument('adresse', type=str, required=True, help="L'adresse du fournisseur est requise")
        # Initialize the parser
        # Parse the incoming request data
        data = parser.parse_args()

        # Extract the fields from the parsed data
        nom = data['nom']
        contact = data['contact']
        adresse = data['adresse']

        # Check if the fournisseur already exists
        existing_fournisseur = Fournisseur.query.filter_by(nom=nom).first()
        if existing_fournisseur:
            return {"msg": "Le fournisseur existe déjà"}, 409  # Conflict if the fournisseur already exists

        # Add the new fournisseur to the database
        new_fournisseur = Fournisseur(nom=nom, contact=contact, adresse=adresse)
        db.session.add(new_fournisseur)
        db.session.commit()

        return {"msg": "Le fournisseur a été ajouté avec succès"}, 201
class patchContract(Resource) :
    @jwt_required()
    def patch(self):
        """
        Cette méthode permet de mettre à jour le statut (etat_contrat) d'un contrat.
        """
        data = request.get_json()

        # Vérifier si "etat_contrat" est présent dans la requête
        etat_contrat = data.get('etat_contrat')
        id = data.get("id")
        if not etat_contrat:
            return {"msg": "Le champ 'etat_contrat' est requis"}, 400

        # Valider la valeur de 'etat_contrat'
        if etat_contrat not in ['résilé', 'suspendu']:
            return {"msg": f"Valeur de 'etat_contrat' invalide: {etat_contrat}. Les valeurs valides sont: 'résilé', 'suspendu'."}, 400

        # Rechercher le contrat par ID
        contrat = Contrat.query.filter_by(id=id).first()
        if not contrat:
            return {"msg": "Contrat introuvable"}, 404

        # Mettre à jour le statut
        contrat.etat_contrat = etat_contrat

        try:
            db.session.commit()
            return {"msg": f"L'état du contrat {id} a été mis à jour avec succès à '{etat_contrat}'"}, 200
        except Exception as e:
            db.session.rollback()
            return {"msg": f"Erreur lors de la mise à jour du contrat: {str(e)}"}, 500

# Ajouter les ressources aux routes
api.add_resource(ContractsResource, '/api/contracts/')
api.add_resource(YearStat, '/api/stats/years/<int:year>')
api.add_resource(ContractTypeStat , '/api/stats/type-contrat')
api.add_resource(ContractPaimentStat ,'/api/stats/type-paiment')
api.add_resource(FournisseursPerformance , '/api/stats/performance')
api.add_resource(insertFourni , "/api/add-fournisseurs")
api.add_resource(patchContract,"/api/patch-contract")
# Route d'accueil
@app.route('/', methods=['GET'])
def home():
    return "<h1>Centre National D'informtique API</h1>"
@app.route('/api/login', methods=['POST'])
def login():
    """
    Endpoint to log in a user and generate a JWT.
    """
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'msg': 'Username and password are required'}), 400

    # Find the user in the database
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'msg': 'Invalid username or password'}), 401

    # Check the password
    if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        return jsonify({'msg': 'Invalid username or password'}), 401

    # Generate the JWT token
    token = create_access_token(identity={'username': username})
    return jsonify({'access_token': token}), 200

if __name__ == '__main__':
    app.run(debug=True)
