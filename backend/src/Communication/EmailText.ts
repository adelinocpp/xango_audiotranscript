
export function genHTMLVerifyEmail(got_username: string, fullLink: string):string{
    var htmlmail: string = `
    <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
    <html>
    <body lang="pt-BR" dir="ltr">
    <p><font size="2" style="font-size: 12pt">
    Olá ${got_username}
    <br/>
    <br/>
    Estamos enviando este e-mail para verificar o cadastro de sua conta no sistema Lwano. Para confirmar seu endereço de e-mail clique no link a seguir.
    <br/>
    <br/>
    <a href="${fullLink}" target="_blank">Verificar email.</a>
    <br/>
    <br/>
    Ou copie o texto a seguir na barra de endereços do navegador:
    <br/>
    <br/>
    ${fullLink}
    <br/>
    <br/>
    Se você não tiver feito este pedido, ignore esta mensagem. O link ficará disponível por 24 horas.
    <br/>
    <br/>
    Muito obrigado
    <br/>
    <br/>
    <p style="border-top: none; border-bottom: 1px solid #000000; border-left: none; border-right: none; padding-top: 0cm; padding-bottom: 0.07cm; padding-left: 0cm; padding-right: 0cm">
    <font size="2" style="font-size: 12pt">Lwano - Forensic Hash Database</font></p>
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
export function genHTMLVerifyExtraEmail(got_username: string, fullLink: string):string{
    var htmlmail: string = `
    <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
    <html>
    <body lang="pt-BR" dir="ltr">
    <p><font size="2" style="font-size: 12pt">
    Olá ${got_username}
    <br/>
    <br/>
    Estamos enviando este e-mail para verificar o endereço de e-mail vinculado a sua conta no sistema Lwano. Para confirmar seu endereço de e-mail clique no link a seguir.
    <br/>
    <br/>
    <a href="${fullLink}" target="_blank">Verificar email.</a>
    <br/>
    <br/>
    Ou copie o texto a seguir na barra de endereços do navegador:
    <br/>
    <br/>
    ${fullLink}
    <br/>
    <br/>
    Se você não tiver feito este pedido, ignore esta mensagem. O link ficará disponível por 24 horas.
    <br/>
    <br/>
    Muito obrigado
    <br/>
    <br/>
    <p style="border-top: none; border-bottom: 1px solid #000000; border-left: none; border-right: none; padding-top: 0cm; padding-bottom: 0.07cm; padding-left: 0cm; padding-right: 0cm">
    <font size="2" style="font-size: 12pt">Lwano - Forensic Hash Database</font></p>
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
export function genHTMLWelcomeEmail(got_username: string, fullLink: string):string{
    var htmlmail: string = `
    <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
    <html>
    <body lang="pt-BR" dir="ltr">
    <p><font size="2" style="font-size: 12pt">
    Olá ${got_username}
    <br/>
    <br/>
    Bem vindo ao sistema Lwano Forensic File Hash. Este sistema foi desenvolvido com objetivo de catalogar os registros digitais examinados por diferentes laboratórios.
    <br/>
    <br/>
    Para acessar o sistema acesse este <a href="${fullLink}/login" target="_blank">link.</a>
    <br/>
    <br/>
    Um guia rápido de acesso as funcionalidades do sistema Lwano pode ser acessado neste <a href="${fullLink}/about" target="_blank">link.</a>
    <br/>
    <br/>
    Em caso de dúvidas e sugestões entre em contato pelos meios disponíveis neste <a href="${fullLink}/contact" target="_blank">link.</a>
    <br/>
    <br/>
    Muito obrigado
    <br/>
    <br/>
    <p style="border-top: none; border-bottom: 1px solid #000000; border-left: none; border-right: none; padding-top: 0cm; padding-bottom: 0.07cm; padding-left: 0cm; padding-right: 0cm">
    <font size="2" style="font-size: 12pt">Lwano - Forensic Hash Database</font></p>
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
export function genHTMLRecoveryPassWordEmail(got_username: string, fullLink: string):string{
    var htmlmail: string = `
    <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
    <html>
    <body lang="pt-BR" dir="ltr">
    <p><font size="2" style="font-size: 12pt">
    Olá ${got_username}
    <br/>
    <br/>
    Estamos enviando este e-mail para recuperação de sua senha no sistema Lwano. Para definir uma nova senha clique no link a seguir.
    <br/>
    <br/>
    <a href="${fullLink}" target="_blank">Redefinir senha.</a>
    <br/>
    <br/>
    Ou copie o texto a seguir na barra de endereços do navegador:
    <br/>
    <br/>
    ${fullLink}
    <br/>
    <br/>
    Se você não tiver feito este pedido, ignore esta mensagem.
    <br/><br/>
    O link ficará disponível por 24 horas.
    <br/>
    <br/>
    Muito obrigado
    <br/>
    <br/>
    <p style="border-top: none; border-bottom: 1px solid #000000; border-left: none; border-right: none; padding-top: 0cm; padding-bottom: 0.07cm; padding-left: 0cm; padding-right: 0cm">
    <font size="2" style="font-size: 12pt">Lwano - Forensic Hash Database</font></p>
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
