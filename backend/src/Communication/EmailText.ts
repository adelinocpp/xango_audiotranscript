
export function genHTMLAccessKeyEmail(got_username: string, accessCode: string):string{
    var htmlmail: string = `
    <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
    <html>
    <body lang="pt-BR" dir="ltr">
    <p><font size="2" style="font-size: 12pt">
    Olá ${got_username}
    <br/>
    <br/>
    Estamos enviando este e-mail para informar seu código de acesso a Base de áudios para Comparação Forense de Locutores.
    <br/>
    <br/>
    Sua chave de acesso é "${accessCode}".
    <br/>
    <br/>
    Se você não tiver feito este pedido de acesso a Base de áudios para Comparação Forense de Locutores, ignore esta mensagem.
    <br/>
    <br/>
    Muito obrigado
    <br/>
    <br/>
    <p style="border-top: none; border-bottom: 1px solid #000000; border-left: none; border-right: none; padding-top: 0cm; padding-bottom: 0.07cm; padding-left: 0cm; padding-right: 0cm">
    <font size="2" style="font-size: 12pt">Base de áudios para Comparação Forense de Locutores</font></p>
    <p><font size="2" style="font-size: 10pt">Dr. Adelino Pinheiro Silva<br/>
    Perito Criminal Oficial<br/>
    Instituto de Criminalística de Minas Gerais<br/>
    Tel: (31) 3330-1723.<br/>
    Whatsapp: (31) 98801-3605.<br/>
    Email: adelino.pinheiro@pc.mg.gov.br<br/>
    </body>
    </html>`;
    return htmlmail;
}
// ----------------------------------------------------------------------------
export function genTXTAccessKeyEmail(got_username: string, accessCode: string):string{
    var htmlmail: string = `
    Olá ${got_username}
    \n\n
    Estamos enviando este e-mail para informar seu código de acesso a Base de áudios para Comparação Forense de Locutores.
    \n\n
    Sua chave de acesso é "${accessCode}".
    \n\n
    Se você não tiver feito este pedido de acesso a Base de áudios para Comparação Forense de Locutores, ignore esta mensagem.
    \n\n
    Muito obrigado
    \n\n
    -------------------------------------------------
    Base de áudios para Comparação Forense de Locutores\n
    Dr. Adelino Pinheiro Silva\n
    Perito Criminal Oficial\n
    Instituto de Criminalística de Minas Gerais\n
    Tel: (31) 3330-1723.\n
    Whatsapp: (31) 98801-3605.\n
    Email: adelino.pinheiro@pc.mg.gov.br
    `;
    return htmlmail;
}
// ----------------------------------------------------------------------------
