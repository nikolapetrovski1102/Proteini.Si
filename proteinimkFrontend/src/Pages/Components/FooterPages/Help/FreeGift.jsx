import ContactLine from "./ContactLine";

export default function FreeGift() {
  return (
    <div>
      <p className="font-bold mb-4">Бесплатен подарок</p>
      <p className="text-gray-600 mb-4">
        Како благодарност за вашата доверба, за одбрани нарачки обезбедуваме
        бесплатен подарок.
      </p>
      <p className="text-gray-600 mb-4">
        Во зависност од вредноста на вашата нарачка, можете да добиете различни
        подароци, како што се:
      </p>
      <ul className="list-disc pl-5 space-y-2 text-gray-600">
        <li>Шејкери</li>
        <li>Шишиња за вода</li>
        <li>Пешкири</li>
        <li>Торби</li>
        <li>Нараквици</li>
        <li>Приврзоци</li>
        <li>И други практични спортски додатоци</li>
      </ul>
      <p className="text-gray-600 mt-4">
        Колку е поголема вредноста на вашата нарачка, толку е поголема и
        вредноста на подарокот што го добивате.
      </p>
      <p className="text-gray-600 mt-4">
        Нашата цел е да ви се заблагодариме за довербата и да го направиме
        секое купување уште попријатно.
      </p>
      <ContactLine />
    </div>
  );
}
