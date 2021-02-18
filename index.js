var puppeteer = require('puppeteer');
var sleep = require('system-sleep');
var filesize = require("filesize");
var Table = require("cli-table");

var Cfg_Usuario = "XXXXXXXX";
var Cfg_Senha = "XXXXXXXX";
var Cfg_Endpoint = "http://192.168.20.1/";

var ListIps = {};

(async function(){

    try {

        browser = await puppeteer.launch( {
            headless: true,
            defaultViewport: null
        });
        page = (await browser.pages())[0];

        await page.goto(Cfg_Endpoint + 'logon/logon.htm');

        await page.type('#txt_usr_name', Cfg_Usuario);
        await page.type('#txt_password', Cfg_Senha);

        await page.click('#btn_logon');

        await page.waitForNavigation();

        if( page.url()== Cfg_Endpoint + 'logon/loginJump.htm' )
        {

            await page.click('#btn_confirm');

            await page.waitForNavigation();

        }

        await page.waitForSelector('iframe');
        
        const frame2h = await page.$(
            '#mainFrame',
        );
        const frame2 = await frame2h.contentFrame();
        
        await frame2.evaluate(() => {
        
            doChangeTab('DhcpServer_ClientList.htm?slt_interface=0');

        });
        
        await frame2.waitForNavigation();

        let IPsDHCP = await frame2.evaluate(() => {
        
            let results = [];
            let trs = Array.from(document.querySelectorAll('#list_table tr'));

            trs.forEach(tr => {
                 
                let tds = Array.from(tr.querySelectorAll('td')).map(td => td.innerText);

                results.push(tds);

            });

            return results;


        });

        IPsDHCP.map(function(item){
        
            if( !ListIps.hasOwnProperty(item[3]) )
            {

                ListIps[item[3]]        = {};

            }

            ListIps[item[3]]["IP"]                  = item[3];
            ListIps[item[3]]["Hostname"]            = item[1];
            ListIps[item[3]]["MAC"]                 = item[2];
            ListIps[item[3]]["IsCadastrado"]        = false;
            ListIps[item[3]]["Upload"]              = 0;
            ListIps[item[3]]["Download"]            = 0;
            ListIps[item[3]]["UploadTotal"]         = 0;
            ListIps[item[3]]["DownloadTotal"]       = 0;

        });

        await frame2.evaluate(() => {
            
            doChangeTab('DhcpServer_StaticIP.htm?slt_interface=0');

        });
        
        await frame2.waitForNavigation();

        let IPsDHCPReservados = await frame2.evaluate(() => {
        
            let results = [];
            let trs = Array.from(document.querySelectorAll('#list_table tr'));

            trs.forEach(tr => {
                
                let tds = Array.from(tr.querySelectorAll('td')).map(td => td.innerText);

                results.push(tds);

            });

            return results;


        });

        IPsDHCPReservados.map(function(item){
        
            if( item[3] != "" )
            {

                if( !ListIps.hasOwnProperty(item[3]) )
                {

                    ListIps[item[3]]        = {};

                }

                ListIps[item[3]]["IP"]                  = item[3];
                ListIps[item[3]]["Hostname"]            = item[5];
                ListIps[item[3]]["MAC"]                 = item[2];
                ListIps[item[3]]["IsCadastrado"]        = true;
                ListIps[item[3]]["Upload"]              = 0;
                ListIps[item[3]]["Download"]            = 0;
                ListIps[item[3]]["UploadTotal"]         = 0;
                ListIps[item[3]]["DownloadTotal"]       = 0;
                
            }

        });

        await frame2.evaluate(() => {
            
            doChangeTab('System_Statics.htm');

        });
        
        await frame2.waitForNavigation();

        let IPsTrafego = await frame2.evaluate(() => {
        
            let results = [];
            let trs = Array.from(document.querySelectorAll('#list_table tr'));

            trs.forEach(tr => {
                
                let tds = Array.from(tr.querySelectorAll('td')).map(td => td.innerText);

                results.push(tds);

            });

            return results;


        });

        IPsTrafego.map(function(item){
        
            if( item[0] != "" )
            {

                if( !ListIps.hasOwnProperty(item[0]) )
                {

                    ListIps[item[0]]        = {};

                }

                ListIps[item[0]]["IP"]                  = item[0];
                ListIps[item[0]]["Upload"]              = item[1]; // KB/s
                ListIps[item[0]]["Download"]            = item[2]; // KB/s
                ListIps[item[0]]["UploadTotal"]         = filesize(item[7].replace(",", "").replace(",", ""), {round: 6}); // Byte
                ListIps[item[0]]["DownloadTotal"]       = filesize(item[8].replace(",", "").replace(",", ""), {round: 6}); // Byte
            }

        });

        const table = new Table({
            head: ['IP', 'MAC', 'Hostname', 'Upload', 'Download', 'Upload Total', 'Download Total']
        });
        
        Object.keys(ListIps).map(function(itemkey, itemdados){

            if( ListIps[itemkey].IP != "" )
            {

                table.push(
                    [ListIps[itemkey].IP, ListIps[itemkey].MAC, ListIps[itemkey].Hostname, ListIps[itemkey].Upload, ListIps[itemkey].Download, ListIps[itemkey].UploadTotal, ListIps[itemkey].DownloadTotal]
                );

            }

        });

        console.log(table.toString());

        browser.close();
        
    } catch (e) {
        
        console.log("e");
        console.log(e);
        
    }

})();