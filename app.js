const express = require("express");
const app = express();
const { MONGOURI } = require("./config/key");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 5000;

mongoose.connection.on("connected", () => {
    console.log("Connected");
});
mongoose.connection.on("error", (err) => {
    console.log("Not connected " + err);

});


require("./models/user");
require("./models/post");

mongoose.connect(MONGOURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});
app.use(express.json())
app.use(require("./routes/auth"));
app.use(require("./routes/post"));
app.use(require("./routes/user"));


if (process.env.NODE_ENV == "production") {
    app.use(express.static("client/build"))
    const path = require("path")
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
    })
}

app.listen(PORT, () => {
    console.log("Server is running on port ", PORT);
})
