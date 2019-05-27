const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const axios = require('axios')
const FormData = require('form-data')
const getXCSRF = require('./getXCSRF')

const app = express()


const port = 7000

app.use(cors({credentials: true, origin: true}))
app.use(bodyParser.json())

app.post('/getSettings', async (req, res) => {
    if (typeof req.body.roblosecurity != 'string') {
        res.statusCode = 400;
        return res.send("The request must have a ROBLOSECURITY of type string")

    }
    
    const settingsRequest = await axios({
        method: 'get',
        url: `https://www.roblox.com/my/settings/json`,
        headers: {
            'Content-Type': "application/json",
            "Cookie": req.body.roblosecurity,
        },
        withCredentials: true
    }).catch(console.log);
    
    
    res.send(settingsRequest.data)
})

app.post('/getTradePrivacy', async (req, res) => {
    if (typeof req.body.roblosecurity != 'string') {
        res.statusCode = 400;
        return res.send("The request must have a ROBLOSECURITY of type string")

    }

    let requestError = false
    
    const settingsRequest = await axios({
        method: 'get',
        url: `https://accountsettings.roblox.com/v1/trade-privacy`,
        headers: {
            'Content-Type': "application/json",
            "Cookie": req.body.roblosecurity,
        },
        withCredentials: true
    }).catch(() => {
        requestError = true
    });
    
    if (requestError) {
        res.statusCode = 400;
        return res.send("The ROBLOSECURITY is not valid")
    }
    try {
        res.send(settingsRequest.data)
    } catch {
        res.send("Error")
    }
    
})

app.post('/sendTradeOffer', async (req, res) => {
    if (typeof req.body.roblosecurity != 'string') {
        res.statusCode = 400;
        return res.send("The request must have a ROBLOSECURITY of type string")

    }

    let requestError = "";
    const XCSRF = await getXCSRF(".ROBLOSECURITY=" + req.body.roblosecurity).catch(() => {
        res.statusCode = 400;
        requestError = "Error with ROBLOSECURITY"
    });
 
    let fdata = new FormData();
    fdata.append('cmd', 'send');
    fdata.append('TradeJSON', JSON.stringify(req.body.trade))

    const sendTradeOffer = await axios({
        method: 'post',
        url: 'https://www.roblox.com/trade/tradehandler.ashx',
        data: fdata,
        headers: Object.assign({}, {
          'Content-Type': 'multipart/form-data',
          'X-CSRF-TOKEN': XCSRF,
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          Cookie: '.ROBLOSECURITY=' + req.body.roblosecurity
        }, fdata.getHeaders()),
        withCredentials: true,
    }).catch((e) => {
        requestError = "Error with sending trade offer"
        
    });
    console.log(sendTradeOffer)

    if (requestError.length > 0) {
        res.statusCode = 400;
        return res.send(requestError)
    }
    if (sendTradeOffer.data.success) {
        res.send("Trade offer Sent")
    } else {
        res.send("Error")
    }
    
})




app.listen(port, () => console.log(`Example app listening on port ${port}!`))