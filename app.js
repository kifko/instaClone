const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = process.env.PORT || 5000; //process.env debido a que Heroku no permite puerto estático
const {
    MONGOURI
} = require("./config/keys");

mongoose.connect(MONGOURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
    // useFindAndModify: false
});
mongoose.connection.on("connected", () => {
    console.log("connected to mongo yess");
});
mongoose.connection.on("error", (err) => {
    console.log("err connecting", err);
});

require("./models/user");
require("./models/post");

app.use(express.json());
app.use(require("./routes/auth"));
app.use(require("./routes/post"));
app.use(require("./routes/user"));

if (process.env.NODE_ENV == "production") {
    app.use(express.static("client/build")); //frontEnd/build/static/css & js
    const path = require("path");
    app.get("*", (req, res) => {
        //Lógica para que cualquier request que haga el cliente (/profile../user..), envialos index.htm a todos los file
        res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
    });
}

app.listen(PORT, () => {
    console.log("server is running on port ", PORT);
});