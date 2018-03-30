(begin
  (define fac (lambda (n) (if (= n 0) 1 (fac (- n 1)))))
  (fac 10))
