(defmacro while (condition body)
  (define loop (lambda ()
                 (if condition
                     (begin body (loop))
                     (+ 1 1))))
  (loop))

(define n 10)

(while (> n 0)
       (set! n (- n 1))
       (display n))
