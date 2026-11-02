export default function ContactLine() {
  return (
    <p className="mt-4 text-sm text-gray-600">
      Контакт:{" "}
      <a className="font-semibold underline" href="tel:+38971399036">
        +389 71 399 036
      </a>{" "}
      |{" "}
      <a
        className="font-semibold underline"
        href="mailto:makedonija@proteini.si"
      >
        makedonija@proteini.si
      </a>
    </p>
  );
}
