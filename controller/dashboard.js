const sequelize = require('sequelize');

//model require
const linkClick = require('../models/campaignLinkCount');
const Contacts = require('../models/contacts');

module.exports.getDashboard = (req, res)=>{
    if(req.session.Id){
        linkClick.findAll({attributes: [[sequelize.fn('sum', sequelize.col('count')), 'count']],raw: true}).then(clickCount=>{
            Contacts.findAll({attributes: [[sequelize.fn('count', sequelize.col('id')), 'totalContacts']],raw: true,where:{user_id:req.session.Id}}).then(totalCon=>{               
                res.render('dashboard',{dataCount:clickCount[0], contact:totalCon[0]});                
            }).catch(err1=>{
                res.json({status:false, message:'cannot find any contact.'})
            })
        }).catch(err2=>{
            res.json({status:false, message:'cannot find any count.'})
        })
    }else{
        res.redirect('/');
    }
}

module.exports.chartData = (req, res)=>{
    linkClick.findAll({
        attributes: [[sequelize.fn('month', sequelize.col('createdAt')),'month'],[sequelize.fn('sum', sequelize.col('count')), 'count']],group:['month'],raw:true})
    .then(click=>{
        res.json({status:true, clickCountData : click})
    }).catch(err=>{
        res.json({status:false, message:'not found.'})
    });
}
