// App
import React from 'react'
import { Link } from 'react-router-dom'

// Router
// import {
//     BrowserRouter as Router,
// } from "react-router-dom"

class Politice extends React.Component {
    render() {
        return (
            <div className="about col-xl-12">
                <div style={{display: 'flex'}}>
                    <div className="col-xl-3 col-lg-6 col-md-6" style={{display: 'flex', order: 1, height: 60}}>
                        
                    </div>
                    <div className="col-xl-9 col-lg-6 col-md-6" style={{display: 'flex', order: 1, height: 60}}>
                        
                    </div>
                </div>

                <div style={{display: 'flex'}}>
                    <div className="col-xl-3 col-lg-6 col-md-6 about-side" style={{display: 'flex', order: 3}}>
                        
                    </div>
                    <div className="col-xl-9 col-lg-6 col-md-6 about-box" style={{display: 'flex', order: 4, flexDirection: 'column'}}>
                        <div className="about-box-text col-xl-12">
                        <h1>Контакты</h1>
                        <p>
                            Адрес: Астраханская область с. Икряное, ул. Мира, д. 30 «а»<br />
                            Телефон <a href="tel:support@hevachat.com">+7 964 888-36-09</a><br />
                            E-mail: <Link to='support'>support@hevachat.com</Link><br /><br />
                            <strong>Реквизиты</strong><br />
                            ИП Рудаев Федор Владимирович<br />
                            ОГРНИП: 319302500044962<br />
                            ИНН: 300436250455<br />
                            Юридический адрес: 416370, Россия, Астраханская обл, Икрянинский рай. с. Икряное, ул. Свободы, д. 40<br />
                            Телефон: <a href="tel:support@hevachat.com">+7 964 888-36-09</a><br />
                        </p>
                        
                        <h1>Способы оплаты</h1>
                        <p>
                            Для выбора оплаты товара с помощью банковской карты на соответствующей странице необходимо нажать кнопку Оплата заказа банковской картой.<br /> Оплата происходит через ПАО СБЕРБАНК с использованием банковских карт следующих платёжных систем:<br />
                            • МИР ;<br />

                            • VISA International ;<br />

                            • Mastercard Worldwide ;<br />

                            • JCB .<br /><br />
                            Для оплаты (ввода реквизитов Вашей карты) Вы будете перенаправлены на платёжный шлюз
                            ПАО СБЕРБАНК. Соединение с платёжным шлюзом и передача информации осуществляется в
                            защищённом режиме с использованием протокола шифрования SSL. В случае если Ваш банк
                            поддерживает технологию безопасного проведения интернет-платежей Verified By Visa,
                            MasterCard SecureCode, MIR Accept, J-Secure для проведения платежа также может
                            потребоваться ввод специального пароля.<br />

                            Настоящий сайт поддерживает 256-битное шифрование. Конфиденциальность сообщаемой
                            персональной информации обеспечивается ПАО СБЕРБАНК. Введённая информация не будет
                            предоставлена третьим лицам за исключением случаев, предусмотренных законодательством
                            РФ. Проведение платежей по банковским картам осуществляется в строгом соответствии с
                            требованиями платёжных систем МИР, Visa Int., MasterCard Europe Sprl, JCB.
                        </p>

                        <h1>Условия возврата</h1>
                        <p>
                            Все спорные вопросы решаются в индивидуальном порядке – и максимально быстро!<br />

                            Свяжитесь с нами: <Link to='support'>support@hevachat.com</Link><br />

                            Отказаться от подписки<br />
                            Возврат переведённых средств, производится на ваш банковский счёт в течение 5-30 рабочих дней
                            (срок зависит от банка, который выдал вашу банковскую карту).
                        </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Politice
