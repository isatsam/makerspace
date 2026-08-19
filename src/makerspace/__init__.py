# Configure the app object, which we can now access via
# from makerspace import app
from flask import Flask

app = Flask(__name__)


# Configure the SQLAlchemy db object, which we can now access via
# from makerspace import db
#
# db.Model object -> to define models
# db.session -> to execute queries
from flask_sqlalchemy import SQLAlchemy
from flask_sqlalchemy.model import Model
from sqlalchemy.orm import DeclarativeBase

class ModelBase(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=ModelBase)

# SQLAlchemy-relevant Flask app configuration
# See more: https://flask-sqlalchemy.readthedocs.io/en/stable/config/
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///database.db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = "your-secret-key-here"

# initialise everything
from . import models
db.init_app(app)
from . import api
